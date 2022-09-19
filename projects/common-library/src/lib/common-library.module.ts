// modules
import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideDatabase, getDatabase } from "@angular/fire/database";
import { provideFirestore, getFirestore } from "@angular/fire/firestore";
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { MaterialModule } from './modules';
// providers
import { provideAnalytics, getAnalytics, ScreenTrackingService, UserTrackingService } from "@angular/fire/analytics";
import { FirebaseDatabaseService, FirebaseFirestoreService, FirebaseStorageService } from "./services";
// components
import { AlertComponent } from './components/alert/alert.component';
import { ButtonComponent } from './components/button/button.component';
import { MainHeaderComponent } from './components/main-header/main-header.component';
import { SecondaryHeaderComponent } from './components/secondary-header/secondary-header.component';
import { MainFooterComponent } from './components/main-footer/main-footer.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
// config
import { FIREBASE_CONFIG } from './firebase.config';


@NgModule({
  declarations: [
    MainHeaderComponent,
    MainFooterComponent,
    SecondaryHeaderComponent,
    PageNotFoundComponent,
    AlertComponent,
    ButtonComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    ScreenTrackingService
  ],
  exports: [
    // components
    MainHeaderComponent,
    MainFooterComponent,
    SecondaryHeaderComponent,
    PageNotFoundComponent,
    AlertComponent,
    ButtonComponent,
    // modules
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class CommonLibraryModule { }

@NgModule({
  imports: [
    provideFirebaseApp(() => initializeApp(FIREBASE_CONFIG)),
    provideAnalytics(() => getAnalytics()),
    provideDatabase(() => getDatabase()),
    provideFirestore(() => getFirestore())
  ],
})
export class CommonFirebaseAppModule {
  static init(): ModuleWithProviders<CommonFirebaseAppModule> {
    return {
      ngModule: CommonFirebaseAppModule,
      providers: [
        {
          provide: FIREBASE_OPTIONS,
          useValue: FIREBASE_CONFIG
        },
        FirebaseDatabaseService,
        FirebaseFirestoreService,
        FirebaseStorageService,
        ScreenTrackingService
      ]
    }
  }
}
