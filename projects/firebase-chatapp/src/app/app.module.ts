// modules
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonFirebaseAppModule, CommonLibraryModule } from 'common-library';
// components
import { AppComponent } from './app.component';
// configs
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CommonLibraryModule,
    CommonFirebaseAppModule.init(environment.firebase),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

