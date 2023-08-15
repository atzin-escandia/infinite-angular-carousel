import {AfterViewInit, Directive, ElementRef} from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[auto-focus]'
})
export class AutoFocusDirective implements AfterViewInit {
  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    this.el.nativeElement.focus();
  }
}

