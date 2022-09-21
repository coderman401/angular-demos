// modules
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
// services
import { AuthService } from './services/auth.service';
import { LocalStorageService } from 'common-library';
// configs
import { Contact } from '../chat/models/contact.model';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

  // var
  isLogin = true;
  loginForm!: FormGroup;
  signupForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  showVerification = false;
  verificationSent = false;
  user!: firebase.User;

  constructor(
    private authService: AuthService,
    private router: Router,
    private localStorageService: LocalStorageService
  ) { }

  ngOnInit(): void {
    this.checkIsLogin();
    this.setLoginFormControl();
    this.setSignupFormControl();
  }

  get fS() { return this.signupForm.controls; }
  get fL() { return this.loginForm.controls; }

  setLoginFormControl() {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required])
    });
  }

  setSignupFormControl() {
    this.signupForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
    });
  }

  login() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.authService.loginUser(this.loginForm.value).then((res) => {
        this.isLoading = false;
        if (res?.user) {
          this.user = res?.user;
          this.process(this.user);
        }
      });
    }
  }

  signup() {
    if (this.signupForm.valid) {
      this.isLoading = true;
      this.authService.registerUser(this.signupForm.value).then((res) => {
        this.isLoading = false
        if (res?.user) {
          this.user = res?.user;
          this.verificationSent = true;
          this.process(this.user);
        }
      });
    }
  }

  process(user: firebase.User) {
    if (user?.email) {
      if (user.emailVerified) {
        const metadata: any = user?.metadata as any;
        const data: Contact = {
          email: user?.email,
          name: this.signupForm.value.name || user.displayName || 'Unknown User',
          userId: user.uid,
          emailVerified: user?.emailVerified,
          profileImage: user?.photoURL || '',
          metadata: {
            creationTime: user.metadata.creationTime,
            lastSignInTime: user.metadata.lastSignInTime,
          }
        }
        this.authService.saveUserDetail(data).subscribe((res) => {
          if (res) {
            this.toggleLogin();
            this.localStorageService.setItem('chatapp-token', user.refreshToken);
            this.localStorageService.setItem('user', data);
            this.router.navigate(['chat']);
          }
        });
      } else {
        this.showVerification = true;
      }
    }
  }

  resendVerification() {
    if (this.user) {
      this.user.sendEmailVerification().then((res) => {
        this.verificationSent = true;
      });
    }
  }

  toggleLogin() {
    this.isLogin = !this.isLogin;
    this.resetForms();
  }

  resetForms() {
    this.loginForm.reset();
    this.signupForm.reset();
  }

  checkIsLogin() {
    const token = this.localStorageService.getItem('chatapp-token');
    if (token !== null) {
      this.router.navigate(['chat']);
    }
  }

}
