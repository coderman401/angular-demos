import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type MascotMood = 'idle' | 'happy' | 'sad' | 'think' | 'wait';

/**
 * "Tic", the game's mascot: a cyan tile with a face. It reacts to the game
 * (happy when you win, sad when you lose, thinking while the computer moves).
 * The animation only plays when the mood changes; the SVG is re-created via
 * the single-item *ngFor so the CSS animation restarts.
 */
@Component({
  selector: 'ttt-mascot',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg *ngFor="let m of [mood]" [attr.class]="'tic ' + m" viewBox="0 0 80 80" aria-hidden="true" focusable="false">
      <rect x="4" y="10" width="72" height="66" rx="20" class="lip" />
      <rect x="4" y="4" width="72" height="66" rx="20" class="face" />
      <circle cx="18" cy="46" r="5" class="cheek" />
      <circle cx="62" cy="46" r="5" class="cheek" />
      <ng-container [ngSwitch]="m">
        <g *ngSwitchCase="'happy'" class="ink-stroke">
          <path d="M21 32q7-9 14 0M45 32q7-9 14 0" />
          <path d="M29 44q11 14 22 0z" class="ink" />
        </g>
        <g *ngSwitchCase="'sad'">
          <path d="M20 22l10 4M60 22l-10 4" class="ink-stroke" />
          <circle cx="28" cy="33" r="5" class="ink" /><circle cx="52" cy="33" r="5" class="ink" />
          <path d="M31 54q9-8 18 0" class="ink-stroke" />
        </g>
        <g *ngSwitchCase="'think'">
          <path d="M44 20q8-5 15 0" class="ink-stroke" />
          <circle cx="30" cy="31" r="5" class="ink" /><circle cx="54" cy="31" r="5" class="ink" />
          <circle cx="32" cy="29" r="1.8" class="glint" /><circle cx="56" cy="29" r="1.8" class="glint" />
          <path d="M33 50h12" class="ink-stroke" />
        </g>
        <g *ngSwitchCase="'wait'">
          <circle cx="26" cy="33" r="5" class="ink" /><circle cx="50" cy="33" r="5" class="ink" />
          <circle cx="24" cy="32" r="1.8" class="glint" /><circle cx="48" cy="32" r="1.8" class="glint" />
          <path d="M34 50q5 4 10 0" class="ink-stroke" />
        </g>
        <g *ngSwitchDefault>
          <circle cx="28" cy="32" r="5" class="ink" /><circle cx="52" cy="32" r="5" class="ink" />
          <circle cx="29.6" cy="30.4" r="1.8" class="glint" /><circle cx="53.6" cy="30.4" r="1.8" class="glint" />
          <path d="M33 47q7 7 14 0" class="ink-stroke" />
        </g>
      </ng-container>
    </svg>`,
  styles: [`
    :host { display: inline-block; width: 64px; height: 64px; flex: none; }
    svg { width: 100%; height: 100%; overflow: visible; transform-origin: 50% 90%; }
    .lip { fill: var(--p-lip); }
    .face { fill: var(--p); }
    .cheek { fill: var(--s); opacity: .9; }
    .ink { fill: var(--on-p); }
    .glint { fill: #fff; }
    .ink-stroke { fill: none; stroke: var(--on-p); stroke-width: 3.4; stroke-linecap: round; stroke-linejoin: round; }
    .happy { animation: hop .6s var(--ease-pop); }
    .sad { animation: droop .5s var(--ease-out); }
    .think { animation: tilt .5s var(--ease-pop) both; }
    .wait, .idle { animation: settle .35s var(--ease-out); }
    @keyframes hop { 30% { transform: translateY(-14px) scale(1.04, .96); } 60% { transform: translateY(0) scale(1.06, .92); } }
    @keyframes droop { 40% { transform: translateY(4px) scale(1.04, .94); } }
    @keyframes tilt { to { transform: rotate(-6deg); } }
    @keyframes settle { from { transform: scale(.96); } }
  `]
})
export class MascotComponent {
  @Input() mood: MascotMood = 'idle';
}
