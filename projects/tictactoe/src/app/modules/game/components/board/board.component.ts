import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, ViewChild } from '@angular/core';

export interface Strike {
  w: number;
  h: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** Presentational 3x3 board. The parent decides what a click means (local or online). */
@Component({
  selector: 'board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnChanges, AfterViewInit {

  readonly cells = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  @Input() squares: string[] = Array(9).fill('');
  @Input() winLine: number[] = [];
  /** Locks the board (not your turn, waiting for opponent, round over...). */
  @Input() disabled = false;
  /** Most recent move, marked with a small dot so you can see what your opponent just did. */
  @Input() lastMove: number | null = null;
  /** The mark a click would place; shown faintly on hover. */
  @Input() ghost: string | null = null;
  @Output() cellClick = new EventEmitter<number>();

  @ViewChild('grid', { static: true }) grid!: ElementRef<HTMLElement>;

  /** Line through the winning tiles, measured from the real tile positions so it is always centred. */
  strike: Strike | null = null;

  /** Roving tab stop for arrow-key navigation. */
  focusIndex = 4;

  constructor(private host: ElementRef<HTMLElement>) { }

  clickSquare(index: number) {
    this.focusIndex = index;
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

  onGridKey(event: KeyboardEvent) {
    const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3 };
    const step = moves[event.key];
    if (step === undefined) return;
    event.preventDefault();
    let next = this.focusIndex + step;
    if (step === -1 && this.focusIndex % 3 === 0) next = this.focusIndex + 2;
    if (step === 1 && this.focusIndex % 3 === 2) next = this.focusIndex - 2;
    if (next < 0) next += 9;
    if (next > 8) next -= 9;
    this.focus(next);
  }

  /** Number keys 1-9 play a cell directly (1 = top left, like a phone keypad). */
  @HostListener('document:keydown', ['$event'])
  onDocumentKey(event: KeyboardEvent) {
    const target = event.target as HTMLElement | null;
    if (!/^[1-9]$/.test(event.key) || event.metaKey || event.ctrlKey || event.altKey) return;
    if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
    if (document.querySelector('.cdk-overlay-container .mat-dialog-container')) return;
    const index = Number(event.key) - 1;
    this.focus(index);
    this.clickSquare(index);
  }

  ngOnChanges() {
    this.strike = null;
    Promise.resolve().then(() => this.measure());
  }

  ngAfterViewInit() {
    // measured one tick later: changing a binding during AfterViewInit would be an ExpressionChanged error
    Promise.resolve().then(() => this.measure());
  }

  @HostListener('window:resize')
  measure() {
    if (this.winLine.length !== 3) {
      this.strike = null;
      return;
    }
    const grid = this.grid.nativeElement;
    const tiles = grid.querySelectorAll<HTMLElement>('.tile');
    const centre = (i: number) => ({ x: tiles[i].offsetLeft + tiles[i].offsetWidth / 2, y: tiles[i].offsetTop + tiles[i].offsetHeight / 2 });
    const a = centre(this.winLine[0]);
    const c = centre(this.winLine[2]);
    // run a little past the outer tiles
    const dx = (c.x - a.x) * 0.1;
    const dy = (c.y - a.y) * 0.1;
    this.strike = { w: grid.clientWidth, h: grid.clientHeight, x1: a.x - dx, y1: a.y - dy, x2: c.x + dx, y2: c.y + dy };
  }

  private focus(index: number) {
    this.focusIndex = index;
    this.host.nativeElement.querySelectorAll<HTMLButtonElement>('.tile')[index]?.focus();
  }

}
