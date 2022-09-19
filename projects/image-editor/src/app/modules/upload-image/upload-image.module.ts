// modules
import { NgModule } from '@angular/core';
import { CommonLibraryModule } from 'projects/common-library/src/public-api';
import { UploadImageRoutingModule } from './upload-image-routing.module';
// components
import { UploadImageComponent } from './upload-image.component';


@NgModule({
  declarations: [
    UploadImageComponent
  ],
  imports: [
    CommonLibraryModule,
    UploadImageRoutingModule
  ]
})
export class UploadImageModule { }
