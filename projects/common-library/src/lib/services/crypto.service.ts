import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})

export class CryptoService {

  constructor() { }

  encrypt(key: string, value: string): string {
    return CryptoJS.AES.encrypt(value, window.btoa(key).trim()).toString();
  }

  decrypt(key: string, textToDecrypt: string) {
    const decrypted = CryptoJS.AES.decrypt(textToDecrypt, window.btoa(key).trim()).toString(CryptoJS.enc.Utf8);
    return !isNaN(+decrypted) ? +decrypted : decrypted;
  }
}
