import { Component, EventEmitter, Input, Output } from '@angular/core';
import { INewCardData } from '../../../../interfaces';
import { TextService } from '../../../../services';
import { PAYMENT_METHOD } from '../../constants/payment-method.constants';
import { IAccordionOption } from '../../interfaces/accordion-option.interface';
import { PurchaseCoreService } from '../../services';

@Component({
  selector: 'payment-method-selector',
  templateUrl: './payment-method-selector.component.html',
  styleUrls: ['./payment-method-selector.component.scss'],
})
export class PaymentMethodSelectorComponent {
  @Input() set options(options: IAccordionOption[]) {
    this._options = options || [];
  }

  get options(): IAccordionOption[] {
    let paymentMethodsOpts = this._options.filter((elem) => elem.key !== PAYMENT_METHOD.APPLE_PAY);

    if (this.isGroupOrder) {
      paymentMethodsOpts = this._options.filter(
        (elem) => ![PAYMENT_METHOD.IDEAL, PAYMENT_METHOD.SEPA, PAYMENT_METHOD.KLARNA].includes(elem.key)
      );
    }

    if (this.isAnyProductSubscriptionActive) {
      paymentMethodsOpts = this._options.filter((elem) => ![PAYMENT_METHOD.KLARNA].includes(elem.key));
    }

    return paymentMethodsOpts;
  }

  @Input() stripeRef: any;
  @Input() isGroupOrder: boolean;
  @Input() isAnyProductSubscriptionActive: boolean;
  @Input() displayKlarnaAdvertising: boolean;

  @Output() newPaymentMethod = new EventEmitter<{ type: PAYMENT_METHOD; methodId: string; setAsFavorite: boolean }>();
  @Output() payWithCard = new EventEmitter<INewCardData>();
  @Output() payWithPaypal = new EventEmitter();
  @Output() payWithKlarna = new EventEmitter();

  get selectedOptKeyIdx(): number {
    return this.options.findIndex((elem) => elem.key === this.selectedOptKey);
  }

  private _options: IAccordionOption[] = [];

  icons = [
    { key: PAYMENT_METHOD.CARD, path: '../../../../../assets/img/payments/Default.svg' },
    { key: PAYMENT_METHOD.IDEAL, path: '../../../../../assets/img/payments/iDeal.svg' },
    { key: PAYMENT_METHOD.SEPA, path: '../../../../../assets/img/payments/Sepa.svg' },
    { key: PAYMENT_METHOD.PAYPAL, path: '../../../../../assets/img/payments/PayPal.svg' },
    { key: PAYMENT_METHOD.KLARNA, path: '../../../../../assets/img/payments/Klarna.svg' },
  ];

  selectedOptKey: string;

  constructor(public textSrv: TextService, private purchaseCoreSrv: PurchaseCoreService) {}

  getOptIcon(key: string): string {
    return this.icons.find((elem) => elem.key === key)?.path;
  }

  onRadioChange(key: PAYMENT_METHOD): void {
    this.selectedOptKey = key;
    this.checkSelectedPaymentMethod(key);
  }

  checkSelectedPaymentMethod(key: PAYMENT_METHOD): void {
    if (key === PAYMENT_METHOD.PAYPAL) {
      this.purchaseCoreSrv.store.setStripeRef({ ...this.purchaseCoreSrv.store.stripeRef, type: PAYMENT_METHOD.PAYPAL });
      this.purchaseCoreSrv.store.setSelectedPaymentMethod({ type: PAYMENT_METHOD.PAYPAL, source: null });
    }
  }

  onAddPaymentMethod(data: { id: string; setAsFavorite: boolean }, type: PAYMENT_METHOD): void {
    this.newPaymentMethod.emit({ type, methodId: data.id, setAsFavorite: data.setAsFavorite });
  }

  onCardPay(data: INewCardData): void {
    this.payWithCard.emit(data);
  }

  onPayWithPaypal(): void {
    this.payWithPaypal.emit();
  }

  onPayWithKlarna(): void {
    this.payWithKlarna.emit();
  }
}
