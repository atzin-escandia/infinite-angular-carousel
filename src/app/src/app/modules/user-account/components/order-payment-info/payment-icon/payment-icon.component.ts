import { Component, Input, OnInit } from '@angular/core';
import { TYPE_PAYMENT_CARD } from '@app/modules/purchase/constants/payment-method.constants';

@Component({
  selector: 'cf-payment-icon',
  templateUrl: './payment-icon.component.html',
  styleUrls: [],
})
export class PaymentIconComponent implements OnInit {
  @Input() isSepa: boolean;
  @Input() isKlarna: boolean;
  @Input() isPaypal: boolean;
  @Input() isCard: boolean;
  @Input() isApplePay: boolean;

  @Input() brand: string;

  icon: string;

  ngOnInit(): void {
    this.setIcon();
  }

  setIcon(): void {
    this.icon = this.isCard
      ? TYPE_PAYMENT_CARD[this.brand]
      : this.isSepa
      ? 'sepa'
      : this.isPaypal
      ? 'pay-pal'
      : this.isKlarna
      ? 'klarna'
      : this.isApplePay
      ? 'apple-pay'
      : 'default';
  }
}
