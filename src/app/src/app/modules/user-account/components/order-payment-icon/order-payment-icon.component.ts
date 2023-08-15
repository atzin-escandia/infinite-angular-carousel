import {Component, Input} from '@angular/core';
// eslint-disable-next-line @typescript-eslint/no-restricted-imports

@Component({
  selector: 'app-order-payment-icon',
  templateUrl: './order-payment-icon.component.html',
  styleUrls: []
})
export class OrderPaymentIconComponent {
  @Input() order: any;
  @Input() isSepa: boolean;
  @Input() env: Environment;
  @Input() isVisa: boolean;
  @Input() isMastercard: boolean;
  @Input() isKlarna: boolean;
  @Input() payment: any;
}
