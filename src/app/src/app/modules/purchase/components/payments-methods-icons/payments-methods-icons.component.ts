import { Component, Input } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { IAllowedPaymentMethods } from '../../../../interfaces';
import { PAYMENT_METHOD } from '../../constants/payment-method.constants';

@Component({
  selector: 'app-payments-methods-icons',
  styleUrls: ['./payments-methods-icons.component.scss'],
  templateUrl: './payments-methods-icons.component.html',
})
export class PaymentsMethodsIconsComponent {
  @Input() showExtraBadges: boolean;
  @Input() shouldBeCentered: boolean;

  @Input() set allowedPaymentMethods(allowedPaymentMethods: IAllowedPaymentMethods) {
    if (allowedPaymentMethods && typeof allowedPaymentMethods === 'object') {
      const filteredAllowedPaymentMethods = Object.entries(allowedPaymentMethods)
        .map(([key, value]) => ({ key, isActive: value }))
        .filter((elem) => elem.isActive)
        .map((elem) => elem.key);

      this.allowedPaymentMethodsBadges = this._allowedPaymentMethodsBadges.filter((elem) =>
        filteredAllowedPaymentMethods.includes(elem.key)
      );
    }
  }

  readonly files = {
    visa: 'Visa.svg',
    mastercard: 'MasterCard.svg',
    sepa: 'Sepa.svg',
    ideal: 'iDeal.svg',
    americanExpress: 'Amex.svg',
    paypal: 'PayPal.svg',
    applePay: 'ApplePay.svg',
    klarna: 'Klarna.svg',
    stripePowered: 'https://common.crowdfarming.com/uploaded-images/1602229987716-581f6a3e-28d1-4813-b12a-4aa1245a096e.svg',
    securePayment: 'https://common.crowdfarming.com/uploaded-images/1602230069926-8525f459-acd5-4a97-b076-87b43ea88419.svg',
  };

  private readonly _allowedPaymentMethodsBadges: { key: PAYMENT_METHOD; file: string }[] = [
    { key: PAYMENT_METHOD.CARD, file: `${environment.domain}/assets/img/payments/${this.files.visa}` },
    { key: PAYMENT_METHOD.CARD, file: `${environment.domain}/assets/img/payments/${this.files.mastercard}` },
    { key: PAYMENT_METHOD.CARD, file: `${environment.domain}/assets/img/payments/${this.files.americanExpress}` },
    { key: PAYMENT_METHOD.SEPA, file: `${environment.domain}/assets/img/payments/${this.files.sepa}` },
    { key: PAYMENT_METHOD.IDEAL, file: `${environment.domain}/assets/img/payments/${this.files.ideal}` },
    { key: PAYMENT_METHOD.PAYPAL, file: `${environment.domain}/assets/img/payments/${this.files.paypal}` },
    { key: PAYMENT_METHOD.APPLE_PAY, file: `${environment.domain}/assets/img/payments/${this.files.applePay}` },
    { key: PAYMENT_METHOD.KLARNA, file: `${environment.domain}/assets/img/payments/${this.files.klarna}` },
  ];

  allowedPaymentMethodsBadges: { key: PAYMENT_METHOD; file: string }[] = [];
}
