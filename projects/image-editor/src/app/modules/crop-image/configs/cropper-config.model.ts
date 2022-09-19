import { ImageTransform, OutputFormat } from "ngx-image-cropper";

export class CropperConfig {
  imageBase64!: string;
  maintainAspectRatio = true;
  containWithinAspectRatio = false;
  aspectRatio = 1 / 1;
  onlyScaleDown = true;
  scale = 1;
  roundCropper = false;
  canvasRotation = 0;
  rotation = 0;
  transform: ImageTransform = {};
  format: OutputFormat = 'webp';
  alignImage: 'left' | 'center' = 'center';

  constructor(imageBase64: string) {
    this.imageBase64 = imageBase64;
  }
}
