import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { FirebaseAnalyticsService, CommonActionService, FirebaseFirestoreService, LocalStorageService, ResponseTypes, SnackbarService } from 'common-library';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from '@firebase/util';
import firebase from 'firebase/compat/app';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  constructor(
    private angularFireStoreService: FirebaseFirestoreService,
    private localStorageService: LocalStorageService,
    private afAuth: AngularFireAuth,
    private snackbarService: SnackbarService,
    private analyticsService: FirebaseAnalyticsService,
    private commonService: CommonActionService,
    private router: Router) { }

  loginUser(data: any) {
    return this.afAuth.signInWithEmailAndPassword(data.email, data.password).then((cred) => {
      const info = this.commonService.clientInfo;
      let uData = {
        email: cred?.user?.email,
        name: cred?.user?.displayName
      };
      if (info) {
        uData = { ...uData, ...info };
      }
      this.analyticsService.logEvent('login', uData);
      return cred;
    }).catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message || 'Something went wrong';
      console.log(errorCode, errorMessage);
      this.snackbarService.showSnackbar(errorMessage, ResponseTypes.error, 5000);
      return null;
    });
  }

  registerUser(data: any) {
    return this.afAuth.createUserWithEmailAndPassword(data.email, data.password).then((cred) => {
      this.analyticsService.setUserInfo(cred.user);
      const info = this.commonService.clientInfo;
      let uData = {
        email: cred?.user?.email,
        name: cred?.user?.displayName
      };
      if (info) {
        uData = { ...uData, ...info };
      }
      this.analyticsService.logEvent('singUp', uData);
      cred?.user?.updateProfile({ displayName: data.name }).then(() => { });
      return cred.user?.sendEmailVerification().then(() => {
        return cred;
      }).catch((err) => {
        console.log(err);
      });
    }).catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message || 'Something went wrong';
      console.log(errorCode, errorMessage);
      this.snackbarService.showSnackbar(errorMessage, ResponseTypes.error, 5000);
      return null;
    });
  }

  saveUserDetail(data: any) {
    return this.angularFireStoreService.getValueOnce('users', 'email', data.email, '==').pipe(
      map((res) => {
        if (res.size === 0) {
          return this.angularFireStoreService.createItemInAFS('users', data).then(res => res.id);
        } else {
          return res.docs[0].id;
        }
      })
    )
  }

  logout() {
    this.localStorageService.clearAll();
    this.router.navigate(['auth']);
    this.afAuth.signOut();
  }

}
