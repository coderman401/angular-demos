// modules
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FirebaseOptions, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { MaterialModule } from './modules';
// providers
import { ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { FirebaseDatabaseService, FirebaseFirestoreService, FirebaseStorageService } from './services';
// components
import { MainHeaderComponent } from './components/main-header/main-header.component';
import { MainFooterComponent } from './components/main-footer/main-footer.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';


@NgModule({
  declarations: [
    MainHeaderComponent,
    MainFooterComponent,
    PageNotFoundComponent
  ],
  imports: [
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    ScreenTrackingService, UserTrackingService
  ],
  exports: [
    // components
    MainHeaderComponent,
    MainFooterComponent,
    PageNotFoundComponent,
    // modules
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class CommonLibraryModule { }

@NgModule({
  imports: [
    provideFirebaseApp(() => initializeApp({}))
  ]
})
export class CommonFirebaseAppModule {
  static init(firebaseConfig: FirebaseOptions): ModuleWithProviders<CommonFirebaseAppModule> {
    return {
      ngModule: CommonFirebaseAppModule,
      providers: [
        {
          provide: FIREBASE_OPTIONS,
          useValue: firebaseConfig
        },
        FirebaseDatabaseService,
        FirebaseFirestoreService,
        FirebaseStorageService,
      ]
    }
  }
}
