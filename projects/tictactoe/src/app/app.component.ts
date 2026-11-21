import { Component, OnInit } from '@angular/core';
import { LocalStorageService, ThemeService } from 'common-library';
import { SoundService } from './services/sound.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'tictactoe';

  constructor(
    public themeService: ThemeService,
    public sound: SoundService,
    private storage: LocalStorageService,
  ) { }

  ngOnInit(): void {
    // First visit: follow the OS colour scheme. After that the saved choice wins.
    if (!this.storage.getItem('themeId') && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      this.themeService.toggleTheme(true);
    }
  }

  toggleTheme() {
    this.themeService.toggleTheme(!this.themeService.isDark);
  }
}
