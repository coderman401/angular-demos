// modules
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AlertComponent } from '../components/alert/alert.component';

@Injectable({
  providedIn: 'root'
})

export class ModalService {

  private _modalRef!: MatDialogRef<any>;

  constructor(private dialog: MatDialog) { }

  get modalRef(): MatDialogRef<any> { return this._modalRef; }
  set modalRef(value: MatDialogRef<any>) { this._modalRef = value; }

  openAlert(message: string) {
    this._modalRef = this.dialog.open(AlertComponent, {
      width: '300px',
      data: { message }
    });
  }
}
