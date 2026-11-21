import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/** The X / O glyphs, drawn as SVG so they stay crisp at any size. Inherits `currentColor`. */
@Component({
  selector: 'ttt-mark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor"
      stroke-width="3.6" stroke-linecap="round">
      <ng-container *ngIf="type === 'X'; else oMark">
        <path class="stroke" d="M5.5 5.5l13 13" />
        <path class="stroke s2" d="M18.5 5.5l-13 13" />
      </ng-container>
      <ng-template #oMark><circle class="stroke" cx="12" cy="12" r="6.9" /></ng-template>
    </svg>`,
  styles: [`
    :host { display: inline-flex; width: 1em; height: 1em; vertical-align: middle; }
    svg { width: 100%; height: 100%; overflow: visible; }
    .stroke { stroke-dasharray: 48; stroke-dashoffset: 0; }
    :host(.draw) .stroke { animation: draw 0.28s var(--ease-out) both; }
    :host(.draw) .s2 { animation-delay: 0.12s; }
    @keyframes draw { from { stroke-dashoffset: 48; } }
  `]
})
export class MarkComponent {
  @Input() type: 'X' | 'O' | string = 'X';
}
