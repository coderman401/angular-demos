import { Component, Input } from "@angular/core";

@Component({
  selector: 'app-secondary-header',
  templateUrl: './secondary-header.component.html',
  styleUrls: ['./secondary-header.component.scss']
})

export class SecondaryHeaderComponent {
  @Input() title!: string;
  @Input() isHeader!: boolean;

  constructor() { }
}

