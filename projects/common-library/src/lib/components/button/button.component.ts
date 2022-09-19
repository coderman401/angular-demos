import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {

  @Input() type!: string;
  @Input() icon?: string;
  @Input() text!: string;
  @Input() disable = false;
  @Input() color = 'primary';
  @Input() className = '';
  @Input() ariaLabel!: string;
  @Output() buttonClick = new EventEmitter();

  constructor() { }

  click() {
    this.buttonClick.emit();
  }

}
