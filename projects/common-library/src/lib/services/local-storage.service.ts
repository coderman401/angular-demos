// modules
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class LocalStorageService {

  constructor() { }

  // set item in localstorage
  setItem(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // get item from localstorage
  getItem(key: string) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  // remove item from localstorage
  removeItem(key: string) {
    localStorage.removeItem(key);
  }

  // clear all items from localstorage
  clearAll() {
    localStorage.clear();
  }

}
