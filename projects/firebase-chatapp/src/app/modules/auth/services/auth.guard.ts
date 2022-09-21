import { Injectable } from '@angular/core';
import { CanActivate, UrlTree, Router } from '@angular/router';
import { LocalStorageService } from 'common-library';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private localStorageService: LocalStorageService,
  ) { }

  canActivate(): boolean | UrlTree {
    const token = this.localStorageService.getItem('chatapp-token');
    if (token !== null) {
      return true; // User is authorized so return true.
    } else {
      return this.router.createUrlTree(['auth']);
    }
  }
}
