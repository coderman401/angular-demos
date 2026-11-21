import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { ActivatedRoute } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { ModalService, ResponseTypes, SnackbarService } from 'common-library';
import { Subscription } from 'rxjs';
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
  online: OnlineState = { connection: 'idle', room: null, you: null };
  busy = false;

  userCreate = new FormControl('', [Validators.required]);
  userJoin = new FormControl('', [Validators.required]);
  roomId = new FormControl('', [Validators.required]);

  private sub?: Subscription;

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
    this.sub = this.socketService.state$.subscribe((state) => this.online = state);

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
    this.sub?.unsubscribe();
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

  changePlayer(event: MatRadioChange) {
    this.selectMode(event.value);
  }

  private selectMode(mode: string) {
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

  changeDifficulty(event: MatRadioChange) {
    this.difficulty = event.value;
    this.gameService.difficulty = this.difficulty;
    this.gameService.resetGame();
  }

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

  get statusMessage(): string {
    const room = this.room;
    if (!room || !this.you) return '';
    const opp = this.opponent ? room.players[this.opponent] : null;
    if (room.status === 'waiting') return 'Waiting for your friend to join…';
    if (room.status === 'finished') {
      if (room.winner === 'draw') return 'It\'s a draw!';
      return room.winner === this.you ? 'You won! 🎉' : `${room.players[room.winner as Mark]?.name ?? 'Opponent'} won`;
    }
    if (opp && !opp.connected) return `${opp.name} lost connection, waiting for them to come back…`;
    return this.isMyTurn ? 'Your turn' : `${opp?.name ?? 'Opponent'}'s turn`;
  }

  get rematchMessage(): string {
    const room = this.room;
    if (!room || room.status !== 'finished' || !this.you || !this.opponent) return '';
    if (room.rematch[this.you]) return 'Waiting for your friend to accept the rematch…';
    if (room.rematch[this.opponent]) return `${room.players[this.opponent]?.name} wants a rematch!`;
    return '';
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

  async rematch() {
    await this.withBusy(() => this.socketService.rematch());
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
