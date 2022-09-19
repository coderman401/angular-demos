import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'upload',
    pathMatch: 'full'
  },
  {
    path: 'upload',
    loadChildren: () => import('./modules/upload-image/upload-image.module').then(m => m.UploadImageModule)
  },
  {
    path: 'crop/:imageId',
    loadChildren: () => import('./modules/crop-image/crop-image.module').then(m => m.CropImageModule)
  },
  {
    path: 'filter/:imageId',
    loadChildren: () => import('./modules/filter-image/filter-image.module').then(m => m.FilterImageModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
