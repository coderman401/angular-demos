// modules
import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AngularFireModule, FIREBASE_OPTIONS } from '@angular/fire/compat';
import { MaterialModule } from './modules';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFireAnalyticsModule } from '@angular/fire/compat/analytics';
// providers
import { FirebaseAnalyticsService, FirebaseDatabaseService, FirebaseFirestoreService, FirebaseStorageService } from "./services";
// components
import { AlertComponent } from './components/alert/alert.component';
import { ButtonComponent } from './components/button/button.component';
import { LoaderComponent } from './components/loader/loader.component';
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
    LoaderComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [],
  exports: [
    // components
    MainHeaderComponent,
    MainFooterComponent,
    SecondaryHeaderComponent,
    PageNotFoundComponent,
    AlertComponent,
    ButtonComponent,
    LoaderComponent,
    // modules
    CommonModule,
    HttpClientModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class CommonLibraryModule { }

@NgModule({
  imports: [
    AngularFireModule.initializeApp(FIREBASE_CONFIG),
    AngularFireDatabaseModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireAnalyticsModule
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
        FirebaseAnalyticsService
      ]
    }
  }
}
