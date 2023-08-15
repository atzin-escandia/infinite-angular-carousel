import { Component, EventEmitter, Input, Output } from '@angular/core';
import { INewCardData, IStripeRef, PAYMENT_METHOD } from '@app/interfaces';
import { TextService } from '@app/services';
import { IAccordionOption } from '@app/modules/purchase/interfaces/accordion-option.interface';
import { ISelectedPaymentMethod } from '../../interfaces/payment.interface';

@Component({
  selector: 'payment-method-selector',
  templateUrl: './payment-method-selector.component.html',
  styleUrls: ['./payment-method-selector.component.scss'],
})
export class PaymentMethodSelectorComponent {
  @Input() options: IAccordionOption[] = [];
  @Input() stripe: stripe.Stripe;
  @Input() stripeRef: IStripeRef;
  @Input() selectedPaymentMethod: ISelectedPaymentMethod;

  @Output() stripeRefChange = new EventEmitter<IStripeRef>();
  @Output() selectedPaymentMethodChange = new EventEmitter<ISelectedPaymentMethod>();
  @Output() payWithCard = new EventEmitter<INewCardData>();
  @Output() payWithPaypal = new EventEmitter();

  get selectedOptKeyIdx(): number {
    return this.options.findIndex((elem) => elem.key === this.selectedOptKey);
  }

  icons = [
    { key: PAYMENT_METHOD.CARD, path: '../../../../../assets/img/payments/Default.svg' },
    { key: PAYMENT_METHOD.IDEAL, path: '../../../../../assets/img/payments/iDeal.svg' },
    { key: PAYMENT_METHOD.SEPA, path: '../../../../../assets/img/payments/Sepa.svg' },
    { key: PAYMENT_METHOD.PAYPAL, path: '../../../../../assets/img/payments/PayPal.svg' },
    { key: PAYMENT_METHOD.KLARNA, path: '../../../../../assets/img/payments/Klarna.svg' },
  ];

  selectedOptKey: string;

  constructor(public textSrv: TextService) {}

  getOptIcon(key: string): string {
    return this.icons.find((elem) => elem.key === key)?.path;
  }

  onRadioChange(key: PAYMENT_METHOD): void {
    this.selectedOptKey = key;
    this.checkSelectedPaymentMethod(key);
  }

  checkSelectedPaymentMethod(key: PAYMENT_METHOD): void {
    if (key === PAYMENT_METHOD.PAYPAL) {
      this.stripeRefChange.emit({ ...this.stripeRef, type: PAYMENT_METHOD.PAYPAL });
      this.selectedPaymentMethodChange.emit({ type: PAYMENT_METHOD.PAYPAL, source: null });
    }
  }

  onCardPay(data: INewCardData): void {
    this.payWithCard.emit(data);
  }

  onPayWithPaypal(): void {
    this.payWithPaypal.emit();
  }
}
