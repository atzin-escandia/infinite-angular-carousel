import { Component, Input } from '@angular/core';
import { PAYMENT_METHOD } from '@app/modules/purchase/constants/payment-method.constants';
import { OrderCustomBox } from '../../interfaces/order-custom-order.interface';
import { UnknownObjectType } from '@app/interfaces';
import { TextService, UtilsService } from '@app/services';
import { VIEW_ORDER_PAYMENT_STATUS } from '@app/constants/order.constants';

@Component({
  selector: 'cf-order-payment-info',
  templateUrl: './order-payment-info.component.html',
  styleUrls: ['./order-payment-info.component.scss'],
})
export class OrderPaymentInfoComponent {
  @Input() set order(newValue: OrderCustomBox) {
    this.orderData = newValue;
    this.paymentData = newValue.paymentMethods.crowdfarmer;
    this.setPaymentMethod();
  }
  @Input() paymentTitle: string;
  @Input() app: boolean;

  orderData: OrderCustomBox;
  paymentData: UnknownObjectType;
  paymentStatus: string;
  isSepa: boolean;
  isKlarna: boolean;
  isPaypal: boolean;
  isCard: boolean;
  isApplePay: boolean;
  cardBrand: string;
  cardLast4: string;

  constructor(public utilsSrv: UtilsService, private textSrv: TextService) {}

  setPaymentMethod(): void {
    this.isSepa = !!this.paymentData.sepa;
    this.isCard = !!(this.paymentData.card || this.paymentData.paymentRequest.id.charges?.data[0]?.payment_method_details?.card);
    this.isPaypal = !!this.paymentData.paypal;
    this.isApplePay =
      this.paymentData.paymentRequest.id.charges?.data[0]?.payment_method_details?.card?.wallet?.type === PAYMENT_METHOD.APPLE_PAY;
    this.isKlarna = !!this.paymentData.paymentRequest?.id?.payment_method_types?.includes(PAYMENT_METHOD.KLARNA);

    this.cardLast4 = this.isCard
      ? this.paymentData?.card?.last4 || this.paymentData.paymentRequest.id.charges?.data[0]?.payment_method_details?.card.last4
      : '';
    this.cardBrand =
      this.paymentData.card?.brand || this.paymentData.paymentRequest.id.charges?.data[0]?.payment_method_details?.card?.brand;
    this.paymentStatus = VIEW_ORDER_PAYMENT_STATUS[this.orderData.orderPaymentStatus];
  }

  /**
   * Open receipt url in browser
   */
  getReceipt(receiptURL: string): void {
    this.app ? window.open(receiptURL, '_self') : window.open(receiptURL);
  }

  getReceiptText(type: string): string {
    const receipText = {
      RECEIPT: this.textSrv.getText('Receipt'),
      CREDIT_NOTE: this.textSrv.getText('credit note'),
    };

    return receipText[type] || '';
  }
}
