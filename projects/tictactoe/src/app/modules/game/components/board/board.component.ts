import { Component } from '@angular/core';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})

export class BoardComponent {

  // vars
  board = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8]
  ];
  squares = Array(9).fill('');
  winnerData: any;

  constructor(public gameService: GameService) { }

  clickSquare(index: number) {
    this.squares = this.gameService.squares;
    this.winnerData = this.gameService.calculateWinner(this.squares);
    if (this.winnerData || this.squares[index]) {
      return;
    }

    this.gameService.updateSquare(index, this.winnerData);
  }

}
