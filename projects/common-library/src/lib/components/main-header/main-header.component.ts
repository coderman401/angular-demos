import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../services';

@Component({
  selector: 'main-header',
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.scss']
})
export class MainHeaderComponent {

  constructor(public themeService: ThemeService) { }

  toggleDarkTheme(checked: boolean) {
    this.themeService.toggleTheme(checked);
  }
}
