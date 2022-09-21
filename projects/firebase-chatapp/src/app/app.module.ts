// modules
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { API_URL, CommonFirebaseAppModule, CommonLibraryModule } from 'common-library';
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
    CommonFirebaseAppModule.init(),
  ],
  providers: [
    { provide: API_URL, useValue: '' }, // providing api_url for using api service
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

