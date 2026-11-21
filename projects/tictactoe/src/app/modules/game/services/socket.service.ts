import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { ResponseTypes, SnackbarService } from 'common-library';
import { BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../../environments/environment';
import { Mark, OnlineState, RoomState, SocketAck } from '../models/room-info.model';

const PLAYER_ID_KEY = 'xo.playerId';
const SESSION_KEY = 'xo.session';
const ACK_TIMEOUT = 8000;

/**
 * Online play over Socket.IO. The server owns the game state; this service only
 * sends intents (create/join/move/next-round/leave) and mirrors the `roomState`
 * broadcasts. It also restores the seat after a reconnect, which happens
 * routinely on Vercel (connections are closed at the function's max duration).
 */
@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {

  private socket?: Socket;
  private nextRoundTimer?: ReturnType<typeof setTimeout>;
  private readonly stateSubject = new BehaviorSubject<OnlineState>({ connection: 'idle', room: null, you: null, nextRoundAt: null });
  readonly state$ = this.stateSubject.asObservable();

  constructor(private zone: NgZone, private snackbar: SnackbarService) { }

  get state(): OnlineState { return this.stateSubject.value; }
  get room(): RoomState | null { return this.state.room; }
  get you(): Mark | null { return this.state.you; }
  get isMyTurn(): boolean {
    const room = this.room;
    return !!room && room.status === 'playing' && room.turn === this.you;
  }

  /** A previous online game in this tab (survives refreshes and reconnects). */
  get hasSavedSession(): boolean { return !!this.readSession(); }

  /** Opens the connection (idempotent). Called when "Play with Friend" is selected. */
  connect() {
    if (this.socket) {
      if (!this.socket.connected) this.socket.connect();
      return;
    }
    this.patch({ connection: 'connecting' });
    const socket = io(environment.socketURL, {
      path: environment.socketPath,
      transports: ['websocket'], // required on Vercel (no sticky HTTP long-polling)
      reconnectionDelay: 500,
      reconnectionDelayMax: 5000,
    });
    this.socket = socket;

    socket.on('connect', () => this.run(() => {
      this.patch({ connection: 'connected' });
      this.restoreSession(); // also re-arms the next-round timer from the fresh roomState
    }));
    socket.on('disconnect', (reason) => this.run(() => {
      this.cancelNextRound();
      // 'io client disconnect' = we closed it on purpose.
      this.patch({ connection: reason === 'io client disconnect' ? 'idle' : 'reconnecting' });
    }));
    socket.on('connect_error', () => this.run(() => {
      this.patch({ connection: this.state.room ? 'reconnecting' : 'offline' });
    }));
    socket.on('roomState', (room: RoomState) => this.run(() => {
      if (this.state.room && room.id !== this.state.room.id) return;
      this.applyRoom(room, this.state.you);
    }));
    socket.on('notice', (data: { message: string }) => this.run(() => {
      this.snackbar.showSnackbar(data.message, ResponseTypes.info);
    }));
  }

  /** Leaves the room (if any) and closes the connection. */
  async disconnect() {
    if (this.state.room) await this.leaveGame();
    this.socket?.disconnect();
    this.patch({ connection: 'idle' });
  }

  async createGame(playerName: string): Promise<SocketAck> {
    const res = await this.request('createGame', { playerName, playerId: this.playerId });
    if (res.ok) this.seat(res);
    return res;
  }

  async joinGame(playerName: string, room: string): Promise<SocketAck> {
    const res = await this.request('joinGame', { playerName, room, playerId: this.playerId });
    if (res.ok) this.seat(res);
    return res;
  }

  playTurn(tile: number): Promise<SocketAck> {
    return this.request('playTurn', { tile });
  }

  async leaveGame(): Promise<SocketAck> {
    this.clearSession();
    this.cancelNextRound();
    this.patch({ room: null, you: null, nextRoundAt: null });
    if (!this.socket?.connected) return { ok: true };
    return this.request('leaveGame');
  }

  ngOnDestroy() {
    this.cancelNextRound();
    this.socket?.disconnect();
  }

  //#region internals

  private request(event: string, payload: object = {}): Promise<SocketAck> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        resolve({ ok: false, code: 'OFFLINE', error: 'Not connected to the game server. Retrying…' });
        return;
      }
      this.socket.timeout(ACK_TIMEOUT).emit(event, payload, (err: Error | null, res: SocketAck) => this.run(() => {
        resolve(err ? { ok: false, code: 'TIMEOUT', error: 'The game server did not respond. Please try again.' } : res);
      }));
    });
  }

  private seat(res: SocketAck) {
    if (!res.room || !res.you) return;
    this.saveSession(res.room.id);
    this.applyRoom(res.room, res.you);
  }

  private restoreSession() {
    const room = this.readSession();
    if (!room) return;
    this.request('rejoin', { room, playerId: this.playerId }).then((res) => {
      if (res.ok) {
        this.seat(res);
      } else if (res.code !== 'OFFLINE' && res.code !== 'TIMEOUT') {
        // Room expired or we were removed from it.
        this.clearSession();
        this.patch({ room: null, you: null, nextRoundAt: null });
        this.snackbar.showSnackbar(res.error || 'Your previous game is no longer available.', ResponseTypes.warning);
      }
    });
  }

  private applyRoom(room: RoomState, you: Mark | null) {
    const prev = this.state.room;
    const roundChanged = !prev || prev.round !== room.round || prev.status !== room.status;
    let nextRoundAt = this.state.nextRoundAt;
    if (room.status !== 'finished' || room.nextRoundInMs === null) {
      nextRoundAt = null;
      this.cancelNextRound();
    } else if (roundChanged || nextRoundAt === null || !this.nextRoundTimer) {
      // The server sends a relative delay, so local clock differences don't matter.
      nextRoundAt = Date.now() + room.nextRoundInMs;
      this.scheduleNextRound(room.round, room.nextRoundInMs);
    }
    this.patch({ room, you, nextRoundAt });
  }

  /**
   * Rounds restart automatically. When the countdown ends, every connected
   * client asks the server for the next round. The call is idempotent, so it
   * doesn't matter which of the two players' request arrives first.
   */
  private scheduleNextRound(round: number, delayMs: number) {
    this.cancelNextRound();
    this.nextRoundTimer = setTimeout(async () => {
      this.nextRoundTimer = undefined;
      const res = await this.request('nextRound', { round });
      if (!res.ok && (res.code === 'TOO_EARLY' || res.code === 'TIMEOUT' || res.code === 'OFFLINE')) {
        // Server clock a bit behind ours, or we're offline right now: try again shortly.
        const room = this.state.room;
        if (room && room.status === 'finished' && room.round === round) {
          this.scheduleNextRound(round, Math.max(300, res.retryInMs ?? 1000));
        }
      }
    }, delayMs + Math.floor(Math.random() * 150)); // jitter: the two clients rarely collide
  }

  private cancelNextRound() {
    if (this.nextRoundTimer) clearTimeout(this.nextRoundTimer);
    this.nextRoundTimer = undefined;
  }

  private patch(partial: Partial<OnlineState>) {
    this.stateSubject.next({ ...this.state, ...partial });
  }

  private run(fn: () => void) {
    this.zone.run(fn);
  }

  /** Per-tab identity: lets the server give the same seat back after a reconnect. */
  private get playerId(): string {
    let id = this.storage?.getItem(PLAYER_ID_KEY);
    if (!id) {
      id = (crypto as any).randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
      this.storage?.setItem(PLAYER_ID_KEY, id as string);
    }
    return id as string;
  }

  private get storage(): Storage | null {
    try { return window.sessionStorage; } catch { return null; }
  }

  private saveSession(room: string) { this.storage?.setItem(SESSION_KEY, room); }
  private readSession(): string | null { return this.storage?.getItem(SESSION_KEY) ?? null; }
  private clearSession() { this.storage?.removeItem(SESSION_KEY); }

  //#endregion internals
}
