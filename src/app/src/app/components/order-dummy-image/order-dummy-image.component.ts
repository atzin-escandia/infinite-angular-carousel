import {Component, Injector} from '@angular/core';
import {BaseComponent} from '../base';

@Component({
  selector: 'order-dummy-image',
  templateUrl: './order-dummy-image.component.html',
  styleUrls: ['./order-dummy-image.component.scss'],
})
export class OrderDummyImageComponent extends BaseComponent {
  constructor(public injector: Injector) {
    super(injector);
  }
}
