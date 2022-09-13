import { EventEmitter, Directive, OnInit, Output, Input, ElementRef } from '@angular/core';
import { timer, Subscription } from 'rxjs';

@Directive({
  selector: '[ddLongPress]'
})
export class LongPressDirective implements OnInit {
  // vars
  @Input() delay = 400;
  @Output() longPressed: EventEmitter<any> = new EventEmitter();

  timerSub!: Subscription;

  constructor(
    private elementRef: ElementRef<HTMLElement>
  ) { }

  ngOnInit() {
    const isTouch = ('ontouchstart' in document.documentElement);
    const element = this.elementRef.nativeElement;
    element.onpointerdown = (ev) => {
      this.timerSub = timer(this.delay).subscribe(() => {
        this.longPressed.emit(ev);
      });
    };
    element.onpointerup = () => { this.unsubscribe(); };
    element.onpointercancel = () => { this.unsubscribe(); };
    if (isTouch) {
      element.onpointerleave = () => { this.unsubscribe(); };
    }
  }

  private unsubscribe() {
    if (this.timerSub && !this.timerSub.closed) { this.timerSub.unsubscribe(); }
  }
}
