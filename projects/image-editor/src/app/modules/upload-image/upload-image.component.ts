import { Component } from '@angular/core';
import { CommonActionService, ImageService, LocalStorageService, ModalService } from 'common-library';
import { CropperService } from '../../shared/services/cropper.service';

@Component({
  selector: 'app-upload-image',
  templateUrl: './upload-image.component.html',
  styleUrls: ['./upload-image.component.scss']
})
export class UploadImageComponent {

  constructor(private cropperService: CropperService, private commonService: CommonActionService, private modalService: ModalService, private imageService: ImageService, private localStorageService: LocalStorageService) { }

  async selectInputEvent(event: any) {
    const files = event.target.files;
    const file: File = files[0];

    if (file.type.includes('image')) {
      this.cropperService.selectedImage = file;
      const base64: string = await this.imageService.blobOrFileToBase64(file) as string;
      this.cropperService.imageBase64 = base64;
      const uniqueId = this.commonService.generateUniqueId();
      this.localStorageService.setItem(uniqueId, base64);
      this.commonService.redirectToPath('crop/' + uniqueId);
    } else {
      this.modalService.openAlert('Please select a valid image file');
    }
  }

}
