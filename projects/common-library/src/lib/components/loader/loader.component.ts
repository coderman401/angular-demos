import { Component, Input } from "@angular/core";

@Component({
  selector: 'app-loader',
  template: `
  <div class="loader">
    <mat-spinner [strokeWidth]="strokeWidth" [diameter]="diameter"></mat-spinner>
    <h3 *ngIf="title">{{title}}</h3>
    <div *ngIf="message" [innerHTML]="message"></div>
  </div>`,
  styleUrls: ['./loader.component.scss']
})

export class LoaderComponent {

  @Input('strokeWidth') strokeWidth = 4;
  @Input('diameter') diameter = 64;
  @Input('title') title!: string;
  @Input('message') message !: string;

  constructor() { }
}

