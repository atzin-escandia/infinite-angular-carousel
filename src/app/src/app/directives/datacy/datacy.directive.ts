import {Directive, ElementRef, Renderer2} from '@angular/core';
import {environment} from '../../../environments/environment';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[data-cy]',
})
export class DatacyDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {
    if (environment.production) {
      renderer.removeAttribute(el.nativeElement, 'data-cy');
    }
  }
}
