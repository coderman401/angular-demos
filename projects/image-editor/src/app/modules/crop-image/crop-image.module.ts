import { NgModule } from '@angular/core';
import { HammerModule } from '@angular/platform-browser';
import { CommonLibraryModule } from 'common-library';
import { ImageCropperModule } from 'ngx-image-cropper';
import { CropImageRoutingModule } from './crop-image-routing.module';

import { CropImageComponent } from './crop-image.component';


@NgModule({
  declarations: [
    CropImageComponent
  ],
  imports: [
    CommonLibraryModule,
    HammerModule,
    ImageCropperModule,
    CropImageRoutingModule
  ]
})
export class CropImageModule { }
