import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CropperService {

  private _selectedImage!: File;
  private _croppedImage!: string;
  private _imageBase64!: string;

  constructor() { }

  //#region getter-setter
  get selectedImage(): File { return this._selectedImage; }
  set selectedImage(value: File | null) { if (value) this._selectedImage = value; }

  get croppedImage(): string { return this._croppedImage; }
  set croppedImage(value: string) { this._croppedImage = value; }

  get imageBase64(): string { return this._imageBase64; }
  set imageBase64(value: string) { this._imageBase64 = value; }
  //#endregion getter-setter
}
