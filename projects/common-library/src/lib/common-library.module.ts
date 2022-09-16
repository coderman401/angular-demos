// modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { MaterialModule } from './modules';
// providers
import { provideAnalytics, getAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
// configs
import { FIREBASE_CONFIG } from './common.config';
// components
import { AlertComponent } from './components/alert/alert.component';
import { MainHeaderComponent } from './components/main-header/main-header.component';
import { MainFooterComponent } from './components/main-footer/main-footer.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';


@NgModule({
  declarations: [
    MainHeaderComponent,
    MainFooterComponent,
    PageNotFoundComponent,
    AlertComponent
  ],
  imports: [
    provideFirebaseApp(() => initializeApp(FIREBASE_CONFIG)),
    provideAnalytics(() => getAnalytics()),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideFirestore(() => getFirestore()),
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    ScreenTrackingService, UserTrackingService
  ],
  exports: [
    // components
    MainHeaderComponent,
    MainFooterComponent,
    PageNotFoundComponent,
    AlertComponent,
    // modules
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class CommonLibraryModule { }
