import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FilterImageRoutingModule } from './filter-image-routing.module';
import { FilterImageComponent } from './filter-image.component';
import { FilterListComponent } from './components/filter-list/filter-list.component';
import { CommonLibraryModule } from 'common-library';


@NgModule({
  declarations: [
    FilterImageComponent,
    FilterListComponent,
  ],
  imports: [
    CommonLibraryModule,
    FilterImageRoutingModule
  ]
})
export class FilterImageModule { }
