// modules
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
// services
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  // vars
  private _isDark$ = new BehaviorSubject<boolean>(false);

  constructor(
    private localStorageService: LocalStorageService) {
    this.initAppTheme();
  }

  //#region getter-setter
  get isDark(): boolean { return this._isDark$.getValue(); }
  set setIsDark(val: boolean) { this._isDark$.next(val); }
  //#endregion getter-setter

  // toggle the app theme
  toggleTheme(bool: boolean, init = false) {
    const themeId = bool ? 'dark-theme' : 'light-theme';
    if (init) {
      document.body.className = 'cyan-theme ' + themeId;
    } else {
      this.setIsDark = bool;
      document.body.className = 'cyan-theme ' + themeId;
      this.localStorageService.setItem('themeId', themeId);

    }
  }

  // function for changing the app theme (dark/light)
  private initAppTheme() {
    const data = this.localStorageService.getItem('themeId');
    const bool = data === 'dark-theme' ? true : false;
    this.setIsDark = bool;
    this.toggleTheme(bool, true);
  }
}
