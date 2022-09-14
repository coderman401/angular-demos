import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { FirebaseFirestoreService, LocalStorageService } from 'common-library';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  constructor(
    private angularFireStoreService: FirebaseFirestoreService,
    private localStorageService: LocalStorageService,
    private router: Router) { }

  login(data: any) {
    return this.angularFireStoreService.getValueOnce('users', 'username', data.username, '==');
  }

  signup(data: any) {
    return this.angularFireStoreService.getValueOnce('users', 'username', data.username, '==');
  }

  insertUser(data: any) {
    return this.angularFireStoreService.createItemInAFS('users', data);
  }

  logout() {
    this.localStorageService.clearAll();
    this.router.navigate(['auth']);
  }

}
