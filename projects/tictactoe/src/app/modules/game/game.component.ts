import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { StateTableComponent } from './components/state-table/state-table.component';
import { WinnersData } from './models/winning-count.model';
import { GameService } from './services/game.service';
import { SocketService } from './services/socket.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent {

  // vars
  player = 'single';
  difficulty = 'hard';
  winningCount!: WinnersData;

  userCreate = new FormControl('', [Validators.required]);
  userJoin = new FormControl('', [Validators.required]);
  roomId = new FormControl('room-', [Validators.required]);

  constructor(
    public gameService: GameService,
    public dialog: MatDialog,
    private socketService: SocketService
  ) { }

  ngOnInit(): void {
    this.initGame();
    this.socketService.initSocket();
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
    this.player = event.value;
    this.gameService.setPlayer(this.player);
    if (this.player === 'single') {
      this.gameService.xIsNext = false;
      this.winningCount = this.gameService.winningCount.one;
    }
    if (this.player === 'two') {
      this.gameService.xIsNext = true;
      this.winningCount = this.gameService.winningCount.two;
    }
    if (this.player === 'friend') {
      this.gameService.xIsNext = true;
    }
    this.gameService.resetGame();
  }

  changeDifficulty(event: MatRadioChange) {
    this.difficulty = event.value;
    this.gameService.difficulty = this.difficulty;
    this.gameService.resetGame();
  }

  createGame() {
    if (this.userCreate.valid && this.userCreate.value) {
      this.socketService.createNewGame(this.userCreate.value);
      this.userCreate.reset();
    }
  }

  joinGame() {
    if (this.userJoin.value && this.roomId.value) {
      this.socketService.joinGame(this.userJoin.value, this.roomId.value);
      this.userJoin.reset();
      this.roomId.reset();
    }
  }

}
