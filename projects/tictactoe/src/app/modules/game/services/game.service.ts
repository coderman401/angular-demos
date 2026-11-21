// modules
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

// components

// services
import { AlgorithmService } from './algorithm.service';

// models
import { WinningCount } from '../models/winning-count.model';
import { LocalStorageService, ModalService } from 'common-library';

@Injectable({
  providedIn: 'root'
})

export class GameService {

  // vars
  private _squares = Array(9).fill('');
  private _xIsNext = true;
  private _player = 'single';
  private _difficulty = 'expert';
  private winnerData: any;
  private _winningCount = new WinningCount();

  lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  constructor(
    public dialog: MatDialog,
    private localStorageService: LocalStorageService,
    private modalService: ModalService,
    private AIService: AlgorithmService,
  ) {
    this.setWinnerCounts();
  }

  //#region getters-setters

  get squares(): string[] { return this._squares; }
  set squares(squares: string[]) { this._squares = squares; }

  get player(): string { return this._player; }
  setPlayer(player: string) { this._player = player; }

  get winningCount(): WinningCount { return this._winningCount; }
  set winningCount(data: WinningCount) { this._winningCount = data; }

  get xIsNext(): boolean { return this._xIsNext; }
  set xIsNext(value: boolean) { this._xIsNext = value; }

  get difficulty(): string { return this._difficulty; }
  set difficulty(value: string) { this._difficulty = value; }

  //#endregion getters-setters

  setWinnerCounts() {
    if (this.localStorageService.getItem('winningCount')) {
      this.winningCount = this.localStorageService.getItem('winningCount');
    } else {
      this.localStorageService.setItem('winningCount', this.winningCount);
    }
  }

  calculateWinner(squares: any) {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.lines.length; i++) {
      const [a, b, c] = this.lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return {
          winner: squares[a],
          line: [a, b, c]
        };
      }
    }
    return null;
  }

  updateSquare(index: number, winnerData: any) {
    // for two player
    if (this.player === 'two') {
      if (winnerData || this.squares[index]) {
        return;
      }
      this.squares[index] = this.xIsNext ? 'X' : 'O';
      this.xIsNext = !this.xIsNext;
    }

    // for single player
    if (this.player === 'single') {
      if (winnerData || this.squares[index]) {
        return;
      }
      this.squares[index] = 'O';
      setTimeout(() => {
        const AIIndex = this.AIService.findBestMove(this.squares, this.difficulty);
        if (AIIndex !== -4) {
          this.squares[AIIndex] = 'X';
        }
      }, 100);
    }

    // Online play ("friend") is server-authoritative and handled by SocketService.
    setTimeout(() => {
      this.checkForWinner(this.squares);
    }, 200);
  }

  checkForWinner(square: string[]) {
    this.winnerData = this.calculateWinner(square);
    let winnerPlayer: string;
    if (this.winnerData) {
      winnerPlayer = this.winnerData.winner.toUpperCase();

      // for single player
      if (this.player === 'single') {
        if (winnerPlayer === 'X') {
          winnerPlayer = 'AI';
          this.winningCount.one.xWins += 1;
          this.xIsNext = true;
        } else {
          winnerPlayer = 'You';
          this.winningCount.one.oWins += 1;
          this.xIsNext = false;
        }
      }
      // for two player
      if (this.player === 'two') {
        if (winnerPlayer === 'X') {
          this.winningCount.two.xWins += 1;
          this.xIsNext = true;
        } else {
          this.winningCount.two.oWins += 1;
          this.xIsNext = false;
        }
      }

      this.localStorageService.setItem('winningCount', this.winningCount);
      this.modalService.openAlert(winnerPlayer + ' Won');
      this.resetGame();

    } else if (!square.includes('')) {
      // game draw
      if (this.player === 'single') {
        this.winningCount.one.draw += 1;
      }
      if (this.player === 'two') {
        this.winningCount.two.draw += 1;
      }
      this.localStorageService.setItem('winningCount', this.winningCount);
      this.modalService.openAlert('Game Draw !!!');
      this.resetGame();
    }
  }

  resetGame() {
    this.winnerData = null;
    this.squares = Array(9).fill('');
  }

}
