import { Component, OnInit } from '@angular/core';
import { FirebaseAnalyticsService, FirebaseDatabaseService, CommonActionService, ApiService } from 'common-library';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'firebase-chatapp';

  constructor(private commonService: CommonActionService, private apiService: ApiService, private analyticsService: FirebaseAnalyticsService, private db: FirebaseDatabaseService) { }

  ngOnInit(): void {
    console.log('app initialized');
    if (environment.production) {
      this.fetchClientInfo();
    }
  }


  fetchClientInfo() {
    this.apiService.get(environment.ipURL, true).subscribe((info: any) => {
      const information: any = info;
      if (info && info?.ip !== '103.238.106.93') {
        this.analyticsService.logEvent('visited', information);
        information.timestamp = new Date().getTime();
        this.commonService.clientInfo = information;
        this.db.createItemInDB('visitors', information);
      }
    });
  }

}
