import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CrowdgivingPriceSummaryComponent } from '../../components/price-summary/price-summary.component';
import { PaymentModule } from '@app/modules/payment/payment.module';
import { TranslocoModule } from '@ngneat/transloco';
import { IAllowedPaymentMethods, UnknownObjectType, UserInterface } from '@app/interfaces';
import { DsLibraryModule } from '@crowdfarming/ds-library';
import { ICGCart } from '../../interfaces/cart.interface';
import { PaymentComponent } from '@app/modules/payment/payment.component';
import { CrowdgivingPageService } from '../../crowdgiving.service';
import { IOrderPayment } from '@app/interfaces/order.interface';

@Component({
  standalone: true,
  selector: 'app-crowdgiving-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  imports: [CommonModule, TranslocoModule, PaymentModule, DsLibraryModule, CrowdgivingPriceSummaryComponent]
})
export class CrowdgivingPaymentComponent {
  @ViewChild('paymentCmp') paymentCmp: PaymentComponent;

  @Input() totalPrice: number;
  @Input() credits: number;
  @Input() user: UserInterface;
  @Input() selectedPaymentId: string;
  @Input() allowedPaymentMethods: IAllowedPaymentMethods;
  @Input() cart: ICGCart[] = [];
  @Input() currentIso: string;
  @Input() purchaseDataExtra: UnknownObjectType = {};

  @Output() selectedPaymentIdChange = new EventEmitter<string>();
  @Output() payCart = new EventEmitter<IOrderPayment>();

  isPaymentMethodSelectorActive = false;

  get isPaymentButtonDisabled(): boolean {
    return !this.selectedPaymentId;
  }

  constructor(private cgPageSrv: CrowdgivingPageService) {}

  // selectedPaymentChangeHandler(
  //   data: { type: PAYMENT_METHOD; source: stripe.Card; intent: stripe.paymentIntents.PaymentIntent }
  // ): void {
  //   this.selectedPaymentChange.emit(data);
  // }

  selectedPaymentIdChangeHandler(paymentId: string): void {
    this.selectedPaymentIdChange.emit(paymentId);
  }

  payWithNewCardHandler(orderPaymentData: IOrderPayment): void {
    this.payCart.emit(orderPaymentData);
  }

  async onPay(): Promise<void> {
    try {
      const orderPaymentData = await this.paymentCmp.payCart();

      this.payCart.emit(orderPaymentData);
    } catch (err) {
      // TODO: Catch error
      console.error(err);
      this.cgPageSrv.setInnerLoader(false, false);
    }
  }
}
