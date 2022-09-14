import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CommonLibraryModule } from 'common-library';
import { AuthRoutingModule } from './auth-routing.module';
import { AuthComponent } from './auth.component';


@NgModule({
  declarations: [AuthComponent],
  imports: [
    CommonModule,
    AuthRoutingModule,
    CommonLibraryModule,
  ]
})
export class AuthModule { }
