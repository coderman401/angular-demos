import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonLibraryModule } from 'common-library';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonLibraryModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
