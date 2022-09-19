import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FilterImageComponent } from './filter-image.component';

const routes: Routes = [{ path: '', component: FilterImageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FilterImageRoutingModule { }
