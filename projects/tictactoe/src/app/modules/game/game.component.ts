import { Clipboard } from '@angular/cdk/clipboard';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ModalService } from 'common-library';
import { Subscription, timer } from 'rxjs';

import { SoundService } from '../../services/sound.service';
import { MascotMood } from './components/mascot/mascot.component';
import { ConfirmComponent } from './components/confirm/confirm.component';
import { StateTableComponent } from './components/state-table/state-table.component';
import { Mark, OnlineState, RoomState, SocketAck } from './models/room-info.model';
import { WinnersData } from './models/winning-count.model';
import { GameService, LOCAL_ROUND_PAUSE_MS } from './services/game.service';
import { SocketService } from './services/socket.service';

export type SheetTone = 'win' | 'lose' | 'draw';

/** The round-end banner that slides up from the bottom (Duolingo-style feedback). */
export interface Sheet {
  tone: SheetTone;
  title: string;
  text: string;
}

interface Speech {
  mood: MascotMood;
  text: string;
}

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {

  player = 'single';
  difficulty = 'expert';
  winningCount!: WinnersData;
  online: OnlineState = { connection: 'idle', room: null, you: null, nextRoundAt: null };
  busy = false;
  /** Whole seconds until the next online round starts (null when no round has just finished). */
  secondsLeft: number | null = null;
  /** Bumped to fire the confetti. */
  confetti = 0;
  /** Which invite button just copied, for inline "Copied" feedback. */
  copied: 'code' | 'link' | null = null;
  /** Most recent online move (for the "last move" dot). */
  onlineLastMove: number | null = null;
  /** Rounds in a row you have won in the current online room. */
  onlineStreak = 0;
  readonly canShare = typeof navigator !== 'undefined' && !!navigator.share;

  readonly modes = [
    { value: 'single', label: 'Computer', icon: 'smart_toy' },
    { value: 'two', label: 'Pass & play', icon: 'groups' },
    { value: 'friend', label: 'Online', icon: 'public' },
  ];
  readonly difficulties = [
    { value: 'easy', label: 'Easy' },
    { value: 'hard', label: 'Hard' },
    { value: 'expert', label: 'Expert' },
  ];

  userCreate = new FormControl('', [Validators.required]);
  userJoin = new FormControl('', [Validators.required]);
  roomId = new FormControl('', [Validators.required]);

  private sub = new Subscription();
  private copiedTimer?: ReturnType<typeof setTimeout>;
  private announcedLocal: unknown = null;

  constructor(
    public gameService: GameService,
    public dialog: MatDialog,
    private socketService: SocketService,
    private modalService: ModalService,
    private sound: SoundService,
    private clipboard: Clipboard,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.player = this.gameService.player;
    this.difficulty = this.gameService.difficulty;
    this.syncWinningCount();
    this.gameService.onAiMove = () => {
      this.sound.play('x');
      this.announceLocalResult();
    };
    this.gameService.onAutoRestart = () => {
      this.announcedLocal = null;
      this.sound.play('tap');
    };

    this.sub.add(this.socketService.state$.subscribe((state) => {
      const prev = this.online;
      this.online = state;
      this.reactToOnline(prev, state);
    }));
    // Drives the "Next round in 3" label; only does work while a round is finished.
    this.sub.add(timer(0, 250).subscribe(() => {
      const at = this.player === 'friend' ? this.online.nextRoundAt : this.gameService.nextRoundAt;
      this.secondsLeft = at ? Math.max(0, Math.ceil((at - Date.now()) / 1000)) : null;
    }));

    // Invite links (?room=CODE) and refreshes during an online game open online mode.
    const invite = this.route.snapshot.queryParamMap.get('room');
    if (invite) {
      this.roomId.setValue(invite.toUpperCase());
    }
    if (invite || this.socketService.hasSavedSession) {
      this.selectMode('friend');
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.gameService.onAiMove = undefined;
    this.gameService.onAutoRestart = undefined;
    if (this.copiedTimer) clearTimeout(this.copiedTimer);
  }

  //#region modes

  async selectMode(mode: string) {
    if (mode === this.player) return;
    if (this.player === 'friend' && this.room && !(await this.confirmLeave())) return;
    const previous = this.gameService.player;
    this.player = mode;
    this.gameService.setPlayer(mode);
    this.gameService.xIsNext = mode !== 'single';
    if (mode === 'friend') {
      this.socketService.connect();
    } else if (previous === 'friend') {
      this.socketService.disconnect();
    }
    this.syncWinningCount();
    this.gameService.resetGame();
    this.announcedLocal = null;
  }

  setDifficulty(value: string) {
    this.difficulty = value;
    this.gameService.difficulty = value;
    this.gameService.resetGame();
    this.announcedLocal = null;
  }

  viewStats() {
    this.dialog.open(StateTableComponent, { data: this.gameService.winningCount, autoFocus: false, width: '380px', maxWidth: '92vw' });
  }

  private syncWinningCount() {
    this.winningCount = this.player === 'two' ? this.gameService.winningCount.two : this.gameService.winningCount.one;
  }

  //#endregion modes

  //#region local play

  onLocalCellClick(index: number) {
    const placed = this.gameService.updateSquare(index);
    if (!placed) return;
    this.sound.play(placed === 'X' ? 'x' : 'o');
    this.announceLocalResult();
  }

  /** Sound, confetti and focus for a finished local round (once per result). */
  private announceLocalResult() {
    const result = this.gameService.result;
    if (!result || result === this.announcedLocal) return;
    this.announcedLocal = result;
    const youWon = this.player === 'single' ? result.winner === 'O' : result.winner !== 'draw';
    const tone = result.winner === 'draw' ? 'draw' : youWon ? 'win' : 'lose';
    this.celebrate(tone);
  }

  //#endregion local play

  //#region online play

  get room(): RoomState | null { return this.online.room; }
  get you(): Mark | null { return this.online.you; }
  get opponent(): Mark | null { return this.you === 'X' ? 'O' : this.you === 'O' ? 'X' : null; }
  get isMyTurn(): boolean { return this.socketService.isMyTurn; }
  get connected(): boolean { return this.online.connection === 'connected'; }
  /** The options column exists whenever there is a game (not in the online start/join form). */
  get hasRail(): boolean { return this.player !== 'friend' || !!this.room; }
  /** Both seats taken: the invite UI goes away and the match runs by itself. */
  get bothJoined(): boolean { return !!this.room?.players.X && !!this.room?.players.O; }
  get finished(): boolean { return this.room?.status === 'finished'; }
  get boardLocked(): boolean { return !this.isMyTurn; }
  get opponentName(): string { return (this.opponent && this.room?.players[this.opponent]?.name) || 'Your friend'; }

  async createGame() {
    if (!this.userCreate.value?.trim()) {
      this.userCreate.markAsTouched();
      return;
    }
    await this.withBusy(() => this.socketService.createGame(this.userCreate.value!.trim()));
  }

  async joinGame() {
    if (!this.userJoin.value?.trim() || !this.roomId.value?.trim()) {
      this.userJoin.markAsTouched();
      this.roomId.markAsTouched();
      return;
    }
    await this.withBusy(() => this.socketService.joinGame(this.userJoin.value!.trim(), this.roomId.value!.trim()));
  }

  async onOnlineCellClick(index: number) {
    if (!this.isMyTurn) return; // the board is locked and the mascot says why
    this.sound.play(this.you === 'X' ? 'x' : 'o');
    const res = await this.socketService.playTurn(index);
    if (!res.ok) this.modalService.openAlert(res.error ?? 'That move was not accepted. Try again.');
  }

  async leaveRoom() {
    if (!(await this.confirmLeave())) return;
    this.onlineStreak = 0;
    await this.socketService.leaveGame();
  }

  /** Asks before leaving a room. Nothing to lose without a room, so no question then. */
  private confirmLeave(): Promise<boolean> {
    if (!this.room) return Promise.resolve(true);
    const playing = this.bothJoined;
    return new Promise((resolve) => {
      this.dialog.open(ConfirmComponent, {
        width: '360px',
        maxWidth: '92vw',
        autoFocus: false,
        data: playing
          ? { title: 'Leave this game?', text: `${this.opponentName} will be left waiting and your score in this room is lost.`, stay: 'Keep playing', leave: 'Leave game' }
          : { title: 'Close this room?', text: 'The room code stops working, so your friend can no longer join with it.', stay: 'Stay', leave: 'Close room' },
      }).afterClosed().subscribe((ok) => resolve(ok === true));
    });
  }

  copyRoomCode() {
    if (this.room && this.clipboard.copy(this.room.id)) this.flashCopied('code');
  }

  copyInviteLink() {
    if (this.room && this.clipboard.copy(this.inviteUrl)) this.flashCopied('link');
  }

  async shareInvite() {
    if (!this.room) return;
    try {
      await navigator.share({ title: 'Play Tic Tac Toe with me', text: `Join my game with code ${this.room.id}`, url: this.inviteUrl });
    } catch {
      // user closed the share sheet; nothing to do
    }
  }

  private get inviteUrl(): string {
    return `${window.location.origin}${window.location.pathname}?room=${this.room?.id}`;
  }

  private flashCopied(what: 'code' | 'link') {
    this.copied = what;
    this.sound.play('tap');
    if (this.copiedTimer) clearTimeout(this.copiedTimer);
    this.copiedTimer = setTimeout(() => this.copied = null, 1800);
  }

  private async withBusy(fn: () => Promise<SocketAck>) {
    if (this.busy) return;
    this.busy = true;
    try {
      const res = await fn();
      if (!res.ok) this.modalService.openAlert(res.error ?? 'Something went wrong. Try again.');
    } finally {
      this.busy = false;
    }
  }

  /** Sounds, last-move dot, streak and confetti from server state changes. */
  private reactToOnline(prev: OnlineState, next: OnlineState) {
    const a = prev.room, b = next.room;
    if (!b || !a || a.id !== b.id) {
      this.onlineLastMove = null;
      if (!b) this.onlineStreak = 0;
      return;
    }
    if (!a.players.O && b.players.O || !a.players.X && b.players.X) this.sound.play('join');
    if (a.round !== b.round) {
      this.onlineLastMove = null;
      return;
    }
    const placed = b.board.findIndex((v, i) => v && !a.board[i]);
    if (placed >= 0) {
      this.onlineLastMove = placed;
      if (b.board[placed] !== next.you) this.sound.play(b.board[placed] === 'X' ? 'x' : 'o');
    }
    if (a.status !== 'finished' && b.status === 'finished') {
      const tone: SheetTone = b.winner === 'draw' ? 'draw' : b.winner === next.you ? 'win' : 'lose';
      this.onlineStreak = tone === 'win' ? this.onlineStreak + 1 : 0;
      this.celebrate(tone);
    }
  }

  //#endregion online play

  //#region presentation

  private celebrate(tone: SheetTone) {
    this.sound.play(tone);
    if (tone === 'win') this.confetti++;
  }

  private lastSheet: Sheet | null = null;

  /** The round-end banner, for every mode. Returns the same object while its content is unchanged. */
  get sheet(): Sheet | null {
    const next = this.buildSheet();
    const prev = this.lastSheet;
    if (next && prev && next.tone === prev.tone && next.title === prev.title && next.text === prev.text) return prev;
    return (this.lastSheet = next);
  }

  private buildSheet(): Sheet | null {
    if (this.player === 'friend') {
      const r = this.room;
      if (!r || r.status !== 'finished' || !this.you) return null;
      if (r.winner === 'draw') return { tone: 'draw', title: 'It\'s a draw', text: '' };
      if (r.winner === this.you) {
        return { tone: 'win', title: 'You won!', text: this.onlineStreak >= 2 ? `${this.onlineStreak} wins in a row.` : '' };
      }
      return { tone: 'lose', title: `${this.opponentName} won`, text: '' };
    }

    const res = this.gameService.result;
    if (!res) return null;
    if (this.player === 'two') {
      if (res.winner === 'draw') return { tone: 'draw', title: 'It\'s a draw', text: 'The other player starts next.' };
      return { tone: 'win', title: `Player ${res.winner} wins!`, text: 'The other player starts next.' };
    }
    if (res.winner === 'draw') return { tone: 'draw', title: 'It\'s a draw', text: 'Not bad. Tic couldn\'t get you.' };
    if (res.winner === 'O') {
      const s = this.gameService.streak;
      return { tone: 'win', title: 'You won!', text: s >= 2 ? `${s} wins in a row. Keep it going.` : `You beat Tic on ${this.difficulty}.` };
    }
    return { tone: 'lose', title: 'Tic won this one', text: 'Watch the corners. You go first.' };
  }

  /** Length of the pause before the next round, for the banner's progress bar. */
  get roundPauseMs(): number {
    return this.player === 'friend' ? this.room?.nextRoundInMs ?? 0 : LOCAL_ROUND_PAUSE_MS;
  }

  /** What the mascot says, and its face. */
  get speech(): Speech {
    if (this.player === 'single') {
      const res = this.gameService.result;
      if (res) return res.winner === 'O' ? { mood: 'sad', text: 'You got me. One more?' }
        : res.winner === 'X' ? { mood: 'happy', text: 'Got you this time!' } : { mood: 'idle', text: 'Nobody wins. Again?' };
      if (this.gameService.aiThinking) return { mood: 'think', text: 'Hmm, let me think…' };
      return this.gameService.squares.some(Boolean)
        ? { mood: 'idle', text: 'Your move.' }
        : { mood: 'idle', text: 'I\'m Tic. You\'re O and you go first. Pick a square.' };
    }
    if (this.player === 'two') {
      const res = this.gameService.result;
      if (res) return res.winner === 'draw' ? { mood: 'idle', text: 'A draw. Swap and go again.' } : { mood: 'happy', text: `Player ${res.winner} takes it!` };
      return { mood: 'idle', text: `Player ${this.gameService.xIsNext ? 'X' : 'O'}, your move.` };
    }

    // online
    if (this.online.connection === 'reconnecting' || this.online.connection === 'offline') {
      return { mood: 'wait', text: 'Lost the connection. Reconnecting, your game is safe.' };
    }
    const r = this.room;
    if (!r) return { mood: 'idle', text: 'Start a game and send your friend the code, or join theirs.' };
    if (!this.bothJoined) return { mood: 'wait', text: 'Send your friend the room code. The game starts when they join.' };
    if (r.status === 'finished') {
      if (r.winner === 'draw') return { mood: 'idle', text: 'A draw! Next round is on its way.' };
      return r.winner === this.you ? { mood: 'happy', text: 'You won this round!' } : { mood: 'sad', text: `${this.opponentName} got this one.` };
    }
    const opp = this.opponent ? r.players[this.opponent] : null;
    if (opp && !opp.connected) return { mood: 'wait', text: `${opp.name} dropped out. They can rejoin, hang on.` };
    return this.isMyTurn ? { mood: 'idle', text: 'Your turn.' } : { mood: 'think', text: `${this.opponentName} is thinking…` };
  }

  /** Data for the two sides of the match strip. */
  side(mark: Mark): { name: string; note: string; score: number; turn: boolean; offline: boolean; you: boolean } {
    if (this.player === 'friend') {
      const p = this.room?.players[mark];
      const r = this.room;
      return {
        name: p?.name ?? 'Waiting…',
        note: !p ? 'Not joined yet' : !p.connected ? 'Offline' : `${this.you === mark ? 'You' : 'Friend'}, plays ${mark}`,
        score: r?.scores[mark] ?? 0,
        turn: r?.status === 'playing' && r.turn === mark,
        offline: !!p && !p.connected,
        you: this.you === mark,
      };
    }
    const single = this.player === 'single';
    const result = this.gameService.result;
    const nextMark = single ? (this.gameService.aiThinking ? 'X' : 'O') : this.gameService.xIsNext ? 'X' : 'O';
    return {
      name: single ? (mark === 'X' ? 'Tic' : 'You') : `Player ${mark}`,
      note: single
        ? (mark === 'X' ? `Plays X, ${this.difficultyLabel.toLowerCase()}` : this.gameService.streak >= 2 ? `${this.gameService.streak} wins in a row` : 'Plays O')
        : (this.xStartsTwoPlayer === (mark === 'X') ? `Plays ${mark}, starts` : `Plays ${mark}`),
      score: mark === 'X' ? this.winningCount.xWins : this.winningCount.oWins,
      turn: !result && nextMark === mark,
      offline: false,
      you: single && mark === 'O',
    };
  }

  get draws(): number {
    return this.player === 'friend' ? this.room?.scores.draw ?? 0 : this.winningCount.draw;
  }

  get ghost(): string | null {
    if (this.player === 'friend') return this.isMyTurn ? this.you : null;
    if (this.gameService.locked) return null;
    return this.player === 'single' ? 'O' : this.gameService.xIsNext ? 'X' : 'O';
  }

  /** Who opened the current pass-and-play round (X when the board is empty and X is next...). */
  private get xStartsTwoPlayer(): boolean {
    const filled = this.gameService.squares.filter(Boolean).length;
    // an even number of marks means the player to move is the one who started
    return filled % 2 === 0 ? this.gameService.xIsNext : !this.gameService.xIsNext;
  }

  private get difficultyLabel(): string {
    return this.difficulties.find((d) => d.value === this.difficulty)?.label ?? '';
  }

  //#endregion presentation

}
