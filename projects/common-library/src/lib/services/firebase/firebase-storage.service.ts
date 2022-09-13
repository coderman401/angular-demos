// modules
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/compat/storage';
// import { LocalNotificationService, NotificationId } from './local-notification.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseStorageService implements OnDestroy {
  // vars
  private uploadPercentage$ = new BehaviorSubject<number>(0);
  private destroy$ = new Subject();

  constructor(
    private storage: AngularFireStorage,
    // private notificationService: LocalNotificationService
  ) { }

  //#region getter-setter
  get uploadPercentage(): Observable<number> { return this.uploadPercentage$.asObservable(); }
  set setUploadPercentage(value: number) {
    const percentage = +value.toFixed(2);
    this.uploadPercentage$.next(percentage);
  }
  //#endregion getter-setter


  /**
   * get fileName from firebase file url.
   *
   * @param url: String
   */
  getFileName(url: string) {
    let fileName = '';
    try {
      fileName = this.storage.storage.refFromURL(url).name;
    } catch (e) {
      fileName = '';
    }
    return fileName;
  }

  /**
   * get file download from firebase file url.
   *
   * @param url: String
   */
  getDownloadURL(url: string) {
    return new Observable((observer) => {
      this.storage.storage.refFromURL(url).getDownloadURL().then((downloadUrl) => {
        observer.next({ status: true, downloadUrl });
      }, (err) => {
        observer.next({ status: false, downloadUrl: '', message: err });
      });
    });
  }

  /**
   * function to upload file to firebase storage.
   *
   * @param filePath: String
   * @param file: File | Buffer | Binary
   */
  uploadImageToFirebaseStorage(filePath: string, file: any) {
    // this.notificationService.createNotificationProgress(NotificationId.upload, 'Uploading...', '', 0);
    return new Observable((observer) => {
      const returnData = { fileURL: '', status: false, message: '' };
      const task = this.storage.upload(filePath, file);
      task.percentageChanges()
        .pipe(
          takeUntil(this.destroy$)
        )
        .subscribe((perc) => {
          this.setUploadPercentage = perc || 0;
          // this.notificationService.updateNotificationProgress(NotificationId.upload, perc, `${perc.toFixed(2)} % uploaded.`);
          if (perc && perc >= 100) {
            // setTimeout(() => {
            //     this.notificationService.cancelNotification(NotificationId.upload);
            // }, 500);
          }
        });
      task.then((snapshot) => {
        const fileURL = this.storage.storage.ref(snapshot.metadata.fullPath).toString();
        return this.storage.storage.refFromURL(fileURL).getDownloadURL();
      }).then((metadata) => {
        returnData.fileURL = metadata;
        returnData.status = true;
        returnData.message = 'File uploaded successfully';
        this.setUploadPercentage = 0;
        observer.next(returnData);
      }).catch((err) => {
        observer.error = err;
      });
    });
  }


  deleteImageFromFirebaseStorage(url: string) {
    return new Observable((observer) => {
      this.storage.storage.refFromURL(url).delete().then(() => {
        observer.next({ status: true, message: 'deleted successfully' });
      }, (err) => console.log(err));
    });
  }

  ngOnDestroy() {
    this.destroy$.next(null); this.destroy$.complete();
  }
}
