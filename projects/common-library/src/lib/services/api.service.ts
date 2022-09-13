// modules
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
// environment
// services
import { LocalStorageService, CommonActionService, SnackbarService } from '.';
import { API_URL } from '../common.config';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // vars
  private url = API_URL;

  constructor(private http: HttpClient, private commonService: CommonActionService, private localStorageService: LocalStorageService, private snackbarService: SnackbarService) { }

  get(path: string, queryParams: any = {}, isDirectURL = false): Observable<any> {
    const params = this.createQueryParams(queryParams);
    const url = isDirectURL ? path : this.url + path;
    return this.http.get(url, { params }).pipe(
      map(res => res),
      catchError((err) => {
        this.handleErrors(err);
        return of({ status: false });
      })
    );
  }

  post(path: string, body: any = {}, queryParams: any = {}): Observable<any> {
    const params = this.createQueryParams(queryParams);
    return this.http.post(this.url + path, body, { params })
      .pipe(
        map(res => res),
        catchError((err) => {
          this.handleErrors(err);
          return of({ status: false });
        })
      );
  }

  createQueryParams(object: any = {}) {
    let params = new HttpParams();
    if (object && Object.keys(object).length) {
      for (const key in object) {
        if (object.hasOwnProperty(key) && object[key]) {
          params = params.set(key, object[key]);
        }
      }
    }

    return params;
  }

  private handleErrors(error: any) {
    let message = '';
    if (error && error.error) {
      message = error.error.errors || error.error.message;
    }
    if (error.status === 401) {
      this.localStorageService.clearAll();
      this.commonService.redirectToAuth();
    }
    message = message?.trim();

    if (error.status === 500) {
      message = 'Internal Server Error';
    }

    if (!message || message === '') {
      message = 'Something went wrong';
    }
    // this.snackbarService.showSnackbar(message, ResponseTypes.error);
  }

}
