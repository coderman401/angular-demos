// modules
import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  // vars
  private readonly _defaultDuration = 3000;
  private _snack!: MatSnackBarRef<any>;

  constructor(private snackBar: MatSnackBar) { }

  /**
   * Show Snackbar
   *
   * @param message: String
   * @param type: ResponseTypes (optional)
   * @param duration?: number (optional)
   */
  showSnackbar(message: string, type: ResponseTypes = ResponseTypes.info, duration: number = this._defaultDuration) {
    if (this._snack) {
      this._snack.dismiss();
    }
    this._snack = this.snackBar.open(message, '', {
      duration,
      panelClass: ['dd-snackbar', `dd-snackbar-${type}`]
    });
  }

}
export enum ResponseTypes {
  success = 'success',
  warning = 'warning',
  error = 'error',
  default = 'default',
  info = 'info'
}
