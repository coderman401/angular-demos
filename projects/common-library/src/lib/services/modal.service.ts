// modules
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class ModalService {

  private _modalRef: any[] = [];
  private _modalLevel = 0;

  constructor(
  ) { }

  get modalRef(): any[] { return this._modalRef; }
  set modalRef(value: any[]) { this._modalRef = value; }

  get modalLevel(): number { return this._modalLevel; }
  set modalLevel(value: number) {
    this._modalLevel = value;
    if (this.modalLevel === 0) {
      this.modalRef = [];
    }
  }
}
