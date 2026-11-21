import { Component, EventEmitter, Input, Output } from '@angular/core';

/** Presentational 3x3 board. The parent decides what a click means (local or online). */
@Component({
  selector: 'board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent {

  readonly cells = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  @Input() squares: string[] = Array(9).fill('');
  @Input() winLine: number[] = [];
  /** Locks the board (not your turn, waiting for opponent, round over...). */
  @Input() disabled = false;
  @Output() cellClick = new EventEmitter<number>();

  clickSquare(index: number) {
    if (this.disabled || this.squares[index]) {
      return;
    }
    this.cellClick.emit(index);
  }

  label(index: number): string {
    const row = Math.floor(index / 3) + 1;
    const col = (index % 3) + 1;
    return `Row ${row}, column ${col}, ${this.squares[index] || 'empty'}`;
  }

}
