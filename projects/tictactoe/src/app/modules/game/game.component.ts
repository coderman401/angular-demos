import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { ModalService, ResponseTypes, SnackbarService } from 'common-library';
import { Subscription, timer } from 'rxjs';
import { StateTableComponent } from './components/state-table/state-table.component';
import { Mark, OnlineState, SocketAck } from './models/room-info.model';
import { WinnersData } from './models/winning-count.model';
import { GameService } from './services/game.service';
import { SocketService } from './services/socket.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {

  // vars
  player = 'single';
  difficulty = 'hard';
  winningCount!: WinnersData;
  online: OnlineState = { connection: 'idle', room: null, you: null, nextRoundAt: null };
  busy = false;
  /** Whole seconds until the next online round starts (null when no round has just finished). */
  secondsLeft: number | null = null;

  readonly modes = [
    { value: 'single', label: 'Single Player', icon: 'smart_toy' },
    { value: 'two', label: 'Two Player', icon: 'groups' },
    { value: 'friend', label: 'Play with Friend', icon: 'public' },
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

  constructor(
    public gameService: GameService,
    public dialog: MatDialog,
    private socketService: SocketService,
    private modalService: ModalService,
    private snackbar: SnackbarService,
    private clipboard: Clipboard,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.initGame();
    this.sub.add(this.socketService.state$.subscribe((state) => this.online = state));
    // Drives the "Next round in 3…" label; cheap, and only does work while a round is finished.
    this.sub.add(timer(0, 250).subscribe(() => {
      const at = this.online.nextRoundAt;
      this.secondsLeft = at ? Math.max(0, Math.ceil((at - Date.now()) / 1000)) : null;
    }));

    // Invite links (?room=CODE) and refreshes during an online game open "Play with Friend".
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
  }

  initGame() {
    this.player = this.gameService.player;
    this.difficulty = this.gameService.difficulty;
    this.winningCount = this.player === 'single' ? this.gameService.winningCount.one : this.gameService.winningCount.two;
  }

  viewStats() {
    const counts = this.gameService.winningCount;
    this.dialog.open(StateTableComponent, {
      data: counts
    });
  }

  selectMode(mode: string) {
    if (mode === this.player) return;
    const previous = this.gameService.player;
    this.player = mode;
    this.gameService.setPlayer(mode);
    if (mode === 'single') {
      this.gameService.xIsNext = false;
      this.winningCount = this.gameService.winningCount.one;
    }
    if (mode === 'two') {
      this.gameService.xIsNext = true;
      this.winningCount = this.gameService.winningCount.two;
    }
    if (mode === 'friend') {
      this.socketService.connect();
    } else if (previous === 'friend') {
      this.socketService.disconnect();
    }
    this.gameService.resetGame();
  }

  setDifficulty(value: string) {
    this.difficulty = value;
    this.gameService.difficulty = value;
    this.gameService.resetGame();
  }

  //#region labels

  get subtitle(): string {
    switch (this.player) {
      case 'single': return 'Beat the computer. You play O.';
      case 'two': return 'Pass and play on one screen.';
      default: return 'Challenge a friend online. Rounds restart automatically.';
    }
  }

  get xLabel(): string {
    if (this.player === 'single') return 'Computer';
    if (this.player === 'two') return 'Player X';
    return this.playerLabel('X');
  }

  get oLabel(): string {
    if (this.player === 'single') return 'You';
    if (this.player === 'two') return 'Player O';
    return this.playerLabel('O');
  }

  get xScore(): number { return this.room && this.player === 'friend' ? this.room.scores.X : this.winningCount.xWins; }
  get oScore(): number { return this.room && this.player === 'friend' ? this.room.scores.O : this.winningCount.oWins; }
  get drawScore(): number { return this.room && this.player === 'friend' ? this.room.scores.draw : this.winningCount.draw; }

  private playerLabel(mark: Mark): string {
    const p = this.room?.players[mark];
    if (!p) return 'Waiting for friend…';
    return this.you === mark ? `${p.name} (you)` : p.name;
  }

  playerOnline(mark: Mark): boolean {
    return this.room?.players[mark]?.connected ?? false;
  }

  //#endregion labels

  //#region local play

  onLocalCellClick(index: number) {
    const winnerData = this.gameService.calculateWinner(this.gameService.squares);
    if (winnerData || this.gameService.squares[index]) {
      return;
    }
    this.gameService.updateSquare(index, winnerData);
  }

  //#endregion local play

  //#region online play

  get room() { return this.online.room; }
  get you(): Mark | null { return this.online.you; }
  get opponent(): Mark | null { return this.you === 'X' ? 'O' : this.you === 'O' ? 'X' : null; }
  get isMyTurn(): boolean { return this.socketService.isMyTurn; }
  get connected(): boolean { return this.online.connection === 'connected'; }
  /** Both seats taken: the invite UI goes away and the match runs by itself. */
  get bothJoined(): boolean { return !!this.room?.players.X && !!this.room?.players.O; }
  get finished(): boolean { return this.room?.status === 'finished'; }
  get boardLocked(): boolean { return !this.isMyTurn; }

  get statusMessage(): string {
    const room = this.room;
    if (!room || !this.you) return '';
    const opp = this.opponent ? room.players[this.opponent] : null;
    if (room.status === 'waiting') return 'Waiting for your friend to join…';
    if (room.status === 'finished') {
      const next = this.secondsLeft === null ? '' : ` Next round in ${this.secondsLeft}s`;
      if (room.winner === 'draw') return `It's a draw!${next}`;
      const who = room.winner === this.you ? 'You won! 🎉' : `${room.players[room.winner as Mark]?.name ?? 'Opponent'} won.`;
      return who + next;
    }
    if (opp && !opp.connected) return `${opp.name} lost connection, waiting for them to come back…`;
    return this.isMyTurn ? 'Your turn' : `${opp?.name ?? 'Opponent'}'s turn`;
  }

  async createGame() {
    if (!this.userCreate.valid || !this.userCreate.value?.trim()) {
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
    if (!this.isMyTurn) {
      this.snackbar.showSnackbar(this.room?.status === 'waiting' ? 'Waiting for player 2 to join the game' : 'It\'s not your turn', ResponseTypes.warning);
      return;
    }
    const res = await this.socketService.playTurn(index);
    if (!res.ok) this.snackbar.showSnackbar(res.error ?? 'Move rejected', ResponseTypes.warning);
  }

  async leaveRoom() {
    await this.socketService.leaveGame();
  }

  copyRoomCode() {
    if (this.room && this.clipboard.copy(this.room.id)) {
      this.snackbar.showSnackbar('Room code copied', ResponseTypes.success);
    }
  }

  copyInviteLink() {
    if (!this.room) return;
    const url = `${window.location.origin}${window.location.pathname}?room=${this.room.id}`;
    if (this.clipboard.copy(url)) {
      this.snackbar.showSnackbar('Invite link copied', ResponseTypes.success);
    }
  }

  private async withBusy(fn: () => Promise<SocketAck>) {
    if (this.busy) return;
    this.busy = true;
    try {
      const res = await fn();
      if (!res.ok) this.modalService.openAlert(res.error ?? 'Something went wrong');
    } finally {
      this.busy = false;
    }
  }

  //#endregion online play

}
