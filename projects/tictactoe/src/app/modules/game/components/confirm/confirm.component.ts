import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmData {
  title: string;
  text: string;
  stay: string;
  leave: string;
}

/** "Are you sure?" dialog. Closes with true when the player confirms leaving. */
@Component({
  selector: 'ttt-confirm',
  template: `
    <h1 mat-dialog-title>{{ data.title }}</h1>
    <p class="text">{{ data.text }}</p>
    <div class="actions">
      <button type="button" class="btn btn--outline" cdkFocusInitial (click)="ref.close(false)">{{ data.stay }}</button>
      <button type="button" class="btn btn--danger" (click)="ref.close(true)">{{ data.leave }}</button>
    </div>`,
  styles: [`
    .text { margin: 0 0 24px; color: var(--muted); font-size: 17px; }
    .actions { display: flex; flex-wrap: wrap; gap: 12px; justify-content: flex-end; }
    @media (max-width: 480px) { .actions .btn { flex: 1 1 100%; } }
  `]
})
export class ConfirmComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmData, public ref: MatDialogRef<ConfirmComponent, boolean>) { }
}
