// modules
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonFirebaseAppModule, CommonLibraryModule } from 'common-library';
import { DEBUG_MODE } from '@angular/fire/compat/analytics';
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
    { provide: DEBUG_MODE, useValue: !environment.production },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

