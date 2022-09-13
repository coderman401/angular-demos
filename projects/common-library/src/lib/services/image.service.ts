import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';

// in bytes, compress images larger than 0.3MB
const fileSizeMax = 0.3 * 1024 * 1024;
// in pixels, compress images have the width or height larger than 1024px
const widthHeightMax = 1024;
const defaultWidthHeightRatio = 0.8;
const defaultQualityRatio = 0.6;


@Injectable({
  providedIn: 'root'
})

export class ImageService {

  constructor(private sanitizer: DomSanitizer) { }

  // convert base64 uri to blob
  b64ToBlob(dataURI: string, imageType: string): Blob {
    const byteString = window.atob(dataURI.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob(
      [ab],
      { type: imageType }
    );
  }

  // convert blob to file
  blobToFile(blob: Blob, fileName: string, imageType: string): File {
    const b: any = blob;
    b.lastModifiedDate = new Date();
    b.name = fileName;

    return blob as File;
  }

  // read image file
  previewImageFile(file: File | Blob) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      window.URL.createObjectURL(file),
    );
  }

  blobOrFileToBase64(file: File | Blob) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    return new Promise((resolve, reject) => {
      reader.onload = ev => {
        resolve(reader.result);
      };
    });
  }

  compress(file: File): Observable<File> {
    const imageType = file.type || 'image/jpg';
    const reader = new FileReader();
    reader.readAsDataURL(file);

    return new Observable(observer => {
      // This event is triggered each time the reading operation is successfully completed.
      reader.onload = ev => {
        // Create an html image element
        const img = this.createImage(ev);
        // Choose the side (width or height) that longer than the other
        const imgWH = img.width > img.height ? img.width : img.height;

        // Determines the ratios to compress the image
        const withHeightRatio = (imgWH > widthHeightMax) ? widthHeightMax / imgWH : defaultWidthHeightRatio;
        const qualityRatio = (file.size > fileSizeMax) ? fileSizeMax / file.size : defaultQualityRatio;
        // Fires immediately after the browser loads the object
        img.onload = () => {
          const elem = document.createElement('canvas');
          // resize width, height

          elem.width = img.width * withHeightRatio;
          elem.height = img.height * withHeightRatio;

          const ctx = elem.getContext('2d') as CanvasRenderingContext2D;
          ctx.drawImage(img, 0, 0, elem.width, elem.height);
          ctx.canvas.toBlob(
            // callback, called when blob created
            blob => {
              const blobValue = blob as any as Blob;
              const compressed = this.blobToFile(blobValue, file.name, imageType);
              observer.next(compressed);
            },
            imageType,
            qualityRatio, // reduce image quantity
          );
        };
      };

      // Catch errors when reading file
      reader.onerror = error => observer.error(error);
    });
  }

  async downloadImageFromUrl(url: string) {
    const response = await fetch(url);
    // converting to blob
    const blob = await response.blob();
    // blob to base64
    const base64 = await this.blobOrFileToBase64(blob) as string;

    return base64;
  }

  private createImage(ev: any) {
    const imageContent = ev.target.result;
    const img = new Image();
    img.src = imageContent;
    return img;
  }

}
