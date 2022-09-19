import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonActionService, LocalStorageService } from 'common-library';
import { Dimensions, ImageCroppedEvent } from 'ngx-image-cropper';
import { CropperService } from '../../shared/services/cropper.service';
import { CropperConfig } from './configs/cropper-config.model';

@Component({
  selector: 'app-crop-image',
  templateUrl: './crop-image.component.html',
  styleUrls: ['./crop-image.component.scss']
})
export class CropImageComponent {

  cropperConfig!: CropperConfig;
  rotation = 0;
  showCropper = false;
  aspectRatio = '1:1';
  aspectRatios = [
    '1:1', '4:3', '16:9', '3:4', '9:16'
  ];
  imageId!: string;

  constructor(public cropperService: CropperService, private commonService: CommonActionService, private activatedRoute: ActivatedRoute, private localStorageService: LocalStorageService) {
    this.imageId = this.activatedRoute.snapshot?.params['imageId'] || '';
    this.initCropper();
  }

  initCropper() {
    if (this.imageId) {
      const event = this.localStorageService.getItem(this.imageId);
      if (event) {
        this.cropperService.imageBase64 = event;
      }
    }
    if (this.cropperService.imageBase64) {
      this.cropperConfig = new CropperConfig(this.cropperService.imageBase64);
    } else {
      this.commonService.redirectToPath('upload')
    }
  }

  cropperReady(sourceImageDimensions: Dimensions) {
    this.showCropper = true;
  }

  // image load fail exception
  loadImageFailed() {
    alert('Image Load Failed');
  }

  // image cropping
  imageCropped(event: ImageCroppedEvent) {
    this.cropperService.croppedImage = event.base64 || '';
    this.localStorageService.setItem('cropped-' + this.imageId, this.cropperService.croppedImage);
  }

  // rotate image counter clock wise
  rotateLeft() {
    this.cropperConfig.canvasRotation--;
    this.flipAfterRotate();
  }

  // rotate image clock wise
  rotateRight() {
    this.cropperConfig.canvasRotation++;
    this.flipAfterRotate();
  }

  // manual rotation by degree
  updateRotation() {
    this.cropperConfig.transform = {
      ...this.cropperConfig.transform,
      rotate: this.cropperConfig.rotation
    };
  }

  private flipAfterRotate() {
    const flippedH = this.cropperConfig.transform.flipH;
    const flippedV = this.cropperConfig.transform.flipV;
    this.cropperConfig.transform = {
      ...this.cropperConfig.transform,
      flipH: flippedV,
      flipV: flippedH
    };
  }

  // setting aspect ratio of image
  setAspectRatio(ratio: string) {
    this.aspectRatio = ratio;
    const value = ratio.split(':');
    this.cropperConfig.aspectRatio = (Number(value[0]) / Number(value[1]));
  }

  // zoom out image
  zoomOut() {
    this.cropperConfig.scale -= .1;
    this.cropperConfig.transform = {
      ...this.cropperConfig.transform,
      scale: this.cropperConfig.scale
    };
  }

  // zoom in image
  zoomIn() {
    this.cropperConfig.scale += .1;
    this.cropperConfig.transform = {
      ...this.cropperConfig.transform,
      scale: this.cropperConfig.scale
    };
  }

  toggleContainWithinAspectRatio() {
    this.cropperConfig.containWithinAspectRatio = !this.cropperConfig.containWithinAspectRatio;
  }


  flipHorizontal() {
    this.cropperConfig.transform = {
      ...this.cropperConfig.transform,
      flipH: !this.cropperConfig.transform.flipH
    };
  }

  flipVertical() {
    this.cropperConfig.transform = {
      ...this.cropperConfig.transform,
      flipV: !this.cropperConfig.transform.flipV
    };
  }

  // reset image clear transformation.
  resetImage() {
    this.cropperConfig = new CropperConfig(this.cropperService.imageBase64);
  }

  // save cropped image and emit the event.
  saveCroppedImage() {
    this.showCropper = false;
    this.commonService.redirectToPath('filter/' + this.imageId);
  }

  skipToFilters() {
    this.showCropper = false;
    this.cropperService.croppedImage = this.cropperService.imageBase64;
    this.localStorageService.setItem('cropped-' + this.imageId, this.cropperService.croppedImage);
    this.commonService.redirectToPath('filter/' + this.imageId);
  }

  goBack() {
    this.cropperService.croppedImage = '';
    this.cropperService.imageBase64;
    this.cropperService.selectedImage = null;
    this.commonService.redirectToPath('upload');
  }

}
