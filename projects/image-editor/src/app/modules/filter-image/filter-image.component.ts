// modules
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// services
import { CommonActionService, LocalStorageService } from 'common-library';
import { CropperService } from '../../shared/services/cropper.service';
// configs
import { Filter, FilterParams, FILTERS } from './configs/filter.data';

@Component({
  selector: 'app-filter-image',
  templateUrl: './filter-image.component.html',
  styleUrls: ['./filter-image.component.scss']
})
export class FilterImageComponent {

  // filter vars
  imageChanged!: any;
  filters: Filter[] = FILTERS;
  currentFilter: Filter = new Filter();
  filterParamsList = [
    { param: 'brightness', max: 200, min: 0 },
    { param: 'contrast', max: 200, min: 0 },
    { param: 'grayScale', max: 100, min: 0 },
    { param: 'hueRotate', max: 360, min: -360 },
    { param: 'saturate', max: 200, min: 0 },
    { param: 'sepia', max: 100, min: 0 },
  ];
  filterParams: FilterParams = {
    sepia: 0,
    brightness: 1,
    saturate: 1,
    contrast: 1,
    hueRotate: 0,
    grayScale: 0
  };
  selected = 0;

  // watermark vars
  isWatermark = false;
  watermarkText = 'Coderman401';
  watermarkTextSize = 18;
  watermarkColor = '#000';
  watermarkAlpha = 1;
  watermarkX = '';
  watermarkY = '';
  imageId!: string;

  constructor(public cropperService: CropperService, private commonService: CommonActionService, private activatedRoute: ActivatedRoute, private localStorageService: LocalStorageService) {
    this.imageId = this.activatedRoute.snapshot?.params['imageId'] || '';
    this.initFilter();
  }

  initFilter() {
    this.currentFilter = this.filters[0];

    Object.keys(this.filterParams).forEach((key: string) => {
      this.filterParams[key] = Math.round(this.currentFilter.filterParams[key] * 100);
    });

    if (this.imageId) {
      const image = this.localStorageService.getItem('cropped-' + this.imageId);
      if (image) {
        this.cropperService.croppedImage = image;
      }
    }
    if (!this.cropperService.croppedImage) {
      this.commonService.redirectToPath('upload');
    }
    this.imageChanged = this.cropperService.croppedImage;

  }

  // manually filter apply
  onInputChange(event: any, type: string) {
    this.addFilterClass();
  }

  applyFilter(event: any) {
    this.currentFilter = event;
    this.selected = this.filters.indexOf(event);
    Object.keys(this.filterParams).forEach((key: string) => {
      this.filterParams[key] = Math.round(this.currentFilter.filterParams[key] * (key === 'hueRotate' ? 1 : 100));
    });
    this.addFilterClass();
  }

  addFilterClass() {
    this.currentFilter.generatedFilter = '';
    this.currentFilter.generatedFilter += `sepia(${this.filterParams.sepia / 100})`;
    this.currentFilter.generatedFilter += ` brightness(${this.filterParams.brightness / 100})`;
    this.currentFilter.generatedFilter += ` saturate(${this.filterParams.saturate / 100})`;
    this.currentFilter.generatedFilter += ` contrast(${this.filterParams.contrast / 100})`;
    this.currentFilter.generatedFilter += ` hue-rotate(${this.filterParams.hueRotate}deg)`;
    this.currentFilter.generatedFilter += ` grayscale(${this.filterParams.grayScale / 100})`;
    if (this.isWatermark) {
      this.changeWatermark('');
    } else {
      const el: any = document.getElementById('addFilter');
      el.style = `filter: ${this.currentFilter.generatedFilter}`;
    }
  }


  addRemoveWatermark(event: any) {
    if (!this.isWatermark) {
      const el: any = document.getElementById('addFilter');
      el.style = `filter: ${this.currentFilter.generatedFilter}`;
    }
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    canvas.width = 320;
    canvas.height = 320;
    const img = new Image();
    img.crossOrigin = '';
    img.src = this.imageChanged;
    img.onload = () => {
      this.loadCanvas(canvas, img, 'watermark');
      const tempCanvas = document.createElement('canvas');
      tempCanvas.setAttribute('id', 'canvas');
      this.addWaterMarkInCanvas(canvas, tempCanvas);
      const div = document.getElementById('addCanvasWatermark');
      if (div) {
        div.appendChild(tempCanvas);
      }
    };
  }

  changeWatermark(event: any) {
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    canvas.width = 320;
    canvas.height = 320;
    const img = new Image();
    img.crossOrigin = '';
    img.src = this.imageChanged;
    img.onload = () => {
      this.loadCanvas(canvas, img, 'watermark');
      const tempCanvas = document.getElementById('canvas') as HTMLCanvasElement;
      if (tempCanvas) {
        this.addWaterMarkInCanvas(canvas, tempCanvas);
      }
    };
  }

  loadCanvas(canvas: HTMLCanvasElement, img: any, type = '') {
    const ctx = canvas.getContext ? canvas.getContext('2d') : null;
    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    const ratio = Math.min(hRatio, vRatio);
    const canvasImageWidth = img.width * ratio;
    const canvasImageHeight = img.height * ratio;
    const xAlign = (Math.abs(canvas.width - canvasImageWidth)) / 2;
    const yAlign = (Math.abs(canvas.height - canvasImageHeight)) / 2;
    console.log(xAlign, yAlign, ratio, canvasImageWidth, canvasImageHeight);
    if ((type === 'watermark' || type === 'save') && ctx) {
      ctx.filter = this.currentFilter.generatedFilter;
    }
    ctx?.drawImage(img, 0, 0, img.width, img.height, xAlign, yAlign, canvasImageWidth, canvasImageHeight);
  }

  addWaterMarkInCanvas(canvas: HTMLCanvasElement, tempCanvas: HTMLCanvasElement) {
    const tempCtx = tempCanvas.getContext('2d');
    let cw;
    let ch;
    cw = tempCanvas.width = canvas.width;
    ch = tempCanvas.height = canvas.height;
    if (tempCtx) {
      tempCtx.drawImage(canvas, 0, 0);
      tempCtx.font = `${this.watermarkTextSize}px Roboto`;
      const textWidth = tempCtx.measureText(this.watermarkText).width;
      tempCtx.globalAlpha = this.watermarkAlpha;
      tempCtx.fillStyle = this.watermarkColor;
      const floatX = this.watermarkTextSize;
      const floatY = this.watermarkTextSize;
      console.log(cw - textWidth - floatX, ch - floatY);
      tempCtx.fillText(this.watermarkText, cw - textWidth - floatX, ch - floatY);
    }
  }

  saveImage() {
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    const img = new Image();
    img.crossOrigin = '';
    img.src = this.imageChanged;
    img.onload = () => {
      this.loadCanvas(canvas, img, 'save');
      const tempCanvas = document.createElement('canvas');
      console.log(img.width, img.height);
      if (this.isWatermark) {
        this.addWaterMarkInCanvas(canvas, tempCanvas);
      } else {
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        tempCtx?.drawImage(canvas, 0, 0);
      }
      const url = tempCanvas.toDataURL('image/base64;');
      const anchor = document.createElement('a');
      // const ext = this.type.replace('image/', '') || 'jpg';
      const timestamp = new Date().getTime();
      anchor.setAttribute('download', timestamp.toString());
      anchor.setAttribute('href', url);
      anchor.click();
    };
  }

  goBack() {
    this.commonService.goBack();
  }
}
