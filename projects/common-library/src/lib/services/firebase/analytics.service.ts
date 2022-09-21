import { Injectable } from "@angular/core"
import { AngularFireAnalytics } from '@angular/fire/compat/analytics';

@Injectable()
export class FirebaseAnalyticsService {
  constructor(
    private analytics: AngularFireAnalytics) { }

  setUserInfo(user: any) {
    this.analytics.setUserProperties({ ...user }).then(() => { });
  }

  logEvent(eventName: string, data: any) {
    this.analytics.logEvent(eventName, { ...data });
  }

}
