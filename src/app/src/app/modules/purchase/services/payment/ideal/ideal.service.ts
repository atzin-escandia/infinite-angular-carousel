import { Injectable } from '@angular/core';
import { PurchaseError } from '@app/modules/purchase/models/error.model';
import { PAYMENT_METHOD } from '../../../../../modules/purchase/constants/payment-method.constants';
import { StripeService } from '../../../../../services';
import { CheckoutStoreService } from '../../store/checkout-store.service';
import { CheckoutPaymentCommonService } from '../common/common.service';

@Injectable()
export class CheckoutPaymentIdealService {
  get stripe(): any {
    return this.checkoutPaymentCommonSrv.getStripe();
  }

  constructor(
    private checkoutStoreSrv: CheckoutStoreService,
    private checkoutPaymentCommonSrv: CheckoutPaymentCommonService,
    private stripeSrv: StripeService
  ) {}

  async createOrder(stripeIntent: stripe.paymentIntents.PaymentIntent): Promise<string> {
    const buttonId = this.checkoutPaymentCommonSrv.generateButtonId();
    const orderId = await this.createOrderHandler(stripeIntent, buttonId);

    return orderId;
  }

  private async createOrderHandler(stripeIntent: stripe.paymentIntents.PaymentIntent, buttonId: string): Promise<string> {
    const { stripeIntentStatuses } = this.checkoutPaymentCommonSrv;

    if ([stripeIntentStatuses.reqConfirmation, stripeIntentStatuses.reqAction].includes(stripeIntent.status)) {
      const cart = await this.checkoutPaymentCommonSrv.getCartAndValidate(this.checkoutStoreSrv.currentIso);
      const confirmStripeRes = await this.stripeSrv.confirm(stripeIntent.id);
      const isStripeActionSuccess = await this.handleIdealStripeAction(confirmStripeRes.confirmedIntent);

      if (isStripeActionSuccess) {
        const paymentId = await this.checkoutPaymentCommonSrv.generateOrder(
          cart,
          {
            type: PAYMENT_METHOD.IDEAL,
            intent: confirmStripeRes.confirmedIntent,
            ideal: confirmStripeRes.confirmedIntent.payment_method,
          },
          buttonId
        );

        return paymentId;
      }
    } else {
      throw new PurchaseError({
        name: 'IDEAL_ERROR',
        message: `${PAYMENT_METHOD.IDEAL} invalid payment intent status`,
        data: {
          stripeIntent,
        },
      });
    }
  }

  private async handleIdealStripeAction(stripeIntent: stripe.paymentIntents.PaymentIntent): Promise<boolean> {
    if (stripeIntent.status === this.checkoutPaymentCommonSrv.stripeIntentStatuses.reqAction) {
      const { error } = await this.stripe.handleCardAction(stripeIntent.client_secret);

      if (error) {
        throw new PurchaseError({
          name: 'IDEAL_ERROR',
          message: `${PAYMENT_METHOD.IDEAL} handle card action error`,
          cause: error,
          data: {
            stripeIntent,
          },
        });
      }
    }

    return true;
  }
}
