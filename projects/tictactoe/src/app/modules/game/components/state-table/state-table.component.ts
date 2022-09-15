import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WinningCount } from '../../models/winning-count.model';

@Component({
  templateUrl: './state-table.component.html',
  styleUrls: ['./state-table.component.scss']
})
export class StateTableComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: WinningCount) { }

}
