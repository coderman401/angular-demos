import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

/** Cell centres in a 0-100 box (3 equal columns with small gaps). */
const CENTRE = [16.4, 50, 83.6];

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
  /** Most recent move, marked with a small dot so you can see what your opponent just did. */
  @Input() lastMove: number | null = null;
  /** The mark a click would place; shown faintly on hover. */
  @Input() ghost: string | null = null;
  @Output() cellClick = new EventEmitter<number>();

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

  get strike(): { x1: number; y1: number; x2: number; y2: number } | null {
    if (this.winLine.length !== 3) return null;
    const [a, , c] = this.winLine;
    const p = (i: number) => ({ x: CENTRE[i % 3], y: CENTRE[Math.floor(i / 3)] });
    const s = p(a), e = p(c);
    // extend a little past the outer cells
    const dx = (e.x - s.x) * 0.12, dy = (e.y - s.y) * 0.12;
    return { x1: s.x - dx, y1: s.y - dy, x2: e.x + dx, y2: e.y + dy };
  }

  private focus(index: number) {
    this.focusIndex = index;
    this.host.nativeElement.querySelectorAll<HTMLButtonElement>('.tile')[index]?.focus();
  }

}
