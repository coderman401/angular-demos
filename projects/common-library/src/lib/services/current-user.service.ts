import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class CurrentUserService {

  private _currentUser$ = new BehaviorSubject<any>({});

  constructor() { }

  get currentUser() { return this._currentUser$.getValue(); }
  get currentUserSubject() { return this._currentUser$.asObservable(); }
  set currentUserValue(user: any) {
    this._currentUser$.next(user);
  }

}
