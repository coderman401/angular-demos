/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationEnd, NavigationExtras, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class CommonActionService {

  private _isMobile = false;
  private _dbName = '';
  private _detectChanges = false;
  private _clientInfo: any;

  constructor(
    private location: Location,
    private router: Router,
  ) {
  }

  get isMobile(): boolean { return this._isMobile; }
  set isMobile(value: boolean) { this._isMobile = value; }

  get dbName() { return this._dbName; }
  set dbName(value) { this._dbName = value; }

  get detectChanges() { return this._detectChanges; }
  set detectChanges(value) { this._detectChanges = value; }

  get clientInfo(): any { return this._clientInfo; }
  set clientInfo(value: any) { this._clientInfo = value; }

  // redirect to home page
  redirectToHome() {
    this.router.navigate(['/']);
  }
  // redirect to login page
  redirectToAuth() {
    this.router.navigate(['/auth']);
  }
  // open url in new tab
  openURLInNewTab(url: string) {
    window.open(url, '_blank');
    return Promise.resolve();
  }

  redirectToPath(path: string, queryParams: any = null, state: any = null) {
    if (queryParams || state) {
      const navigationExtras: NavigationExtras = {
        queryParams,
        state
      };
      this.router.navigate([path], navigationExtras);
    } else {
      this.router.navigate([path]);
    }
  }

  goBack(detectChanges: boolean = false) {
    this.detectChanges = detectChanges;
    this.location.back();
  }

  detectRouteChanges() {
    return this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).pipe(
      map(e => ({ change: this.detectChanges }))
    );
  }


  generateUniqueId() {
    let unique = '';
    const random = Math.random();
    unique = random.toString(36).split('').splice(2, 8).join('');

    return unique;
  }

  getNextDate(date: any) {
    const d = new Date(date);
    const today = new Date();
    const eventDate = new Date(today.getFullYear(), d.getMonth(), d.getDate());
    if (today.getFullYear() >= d.getFullYear() && (today.getMonth() === d.getMonth() && today.getDate() > d.getDate()) || (today.getMonth() > d.getMonth())) {
      eventDate.setFullYear(today.getFullYear() + 1);
    }

    return eventDate.getTime();
  }


  random(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  // filter deleted items
  filterDeleted(data: any[]) {
    return data.filter((s: any) => !s.isDeleted);
  }
  // filter favourite items
  filterFavourite(data: any[]) {
    return data.filter((s: any) => s.isFavourite === true);
  }

  // sort data
  sortData(data: any[], field: string, order: 'asc' | 'desc' = 'asc') {
    if (order === 'asc') {
      return data.sort((a, b) => (this.getFieldValue(field, a) > this.getFieldValue(field, b)) ? 1 : ((this.getFieldValue(field, a) < this.getFieldValue(field, b)) ? -1 : 0));
    }
    if (order === 'desc') {
      return data.sort((a, b) => (this.getFieldValue(field, b) > this.getFieldValue(field, a)) ? 1 : ((this.getFieldValue(field, b) < this.getFieldValue(field, a)) ? -1 : 0));
    }
    return data;
  }

  private getFieldValue(key: string, object: any) {
    const arr = ['date', 'timestamp', 'createdAt', 'updatedAt', 'completedAt'];
    if (arr.includes(key)) {
      const value = object[key] ? new Date(object[key]) : new Date();
      return value?.getTime();
    } else {
      return object[key];
    }
  }

  downloadFileFromURL(url: string) {
    return new Observable((observer) => {
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = () => {
        const blob = xhr.response;
        observer.next({ status: true, file: blob });
      };
      xhr.onerror = () => {
        observer.next({ status: false, message: 'fail to get file from url' });
      };
      xhr.open('GET', url);
      xhr.send();
    });
  }

}
