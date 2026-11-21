import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';

interface Piece { x: number; dx: number; r: number; delay: number; color: string; shape: string; }

/**
 * Brand-coloured confetti, fired only when you win. Each change of `fire`
 * replays it. Skipped entirely when the user prefers reduced motion.
 */
@Component({
  selector: 'ttt-confetti',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *ngFor="let burst of bursts">
      <i *ngFor="let p of burst" [class]="'piece ' + p.shape" [style.left.%]="p.x" [style.background]="p.color"
        [style.--dx.px]="p.dx" [style.--r.deg]="p.r" [style.animation-delay.ms]="p.delay"></i>
    </ng-container>`,
  styles: [`
    :host { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 40; }
    .piece { position: absolute; top: -16px; width: 10px; height: 14px; border-radius: 3px;
      animation: fall 1.6s cubic-bezier(.2,.6,.4,1) forwards; opacity: 0; }
    .round { width: 11px; height: 11px; border-radius: 50%; }
    .bar { width: 6px; height: 18px; }
    @keyframes fall {
      0% { opacity: 1; transform: translate3d(0, 0, 0) rotate(0); }
      100% { opacity: 0; transform: translate3d(var(--dx), 105vh, 0) rotate(var(--r)); }
    }
  `]
})
export class ConfettiComponent implements OnChanges {
  @Input() fire = 0;
  bursts: Piece[][] = [];

  ngOnChanges() {
    if (!this.fire || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      this.bursts = [];
      return;
    }
    const colors = ['var(--p)', 'var(--s)', 'var(--p-lip)', 'var(--s-lip)', '#ffc800'];
    const shapes = ['', 'round', 'bar'];
    // a new array identity re-renders the pieces, restarting the animation
    this.bursts = [Array.from({ length: 42 }, (_, i) => ({
      x: Math.random() * 100,
      dx: (Math.random() - 0.5) * 240,
      r: (Math.random() - 0.5) * 900,
      delay: Math.random() * 280,
      color: colors[i % colors.length],
      shape: shapes[i % shapes.length],
    }))];
  }
}
