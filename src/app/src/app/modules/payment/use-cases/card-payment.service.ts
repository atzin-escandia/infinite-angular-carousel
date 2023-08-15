import { Injectable } from '@angular/core';
import { INewCardData, PAYMENT_METHOD, UnknownObjectType } from '@app/interfaces';
import { IOrderPayment } from '@app/interfaces/order.interface';
import { PaymentCommonService } from '../services';
import { CreateStripeIntentUseCaseService } from './create-stripe-intent.service';
import { ConfirmStripeCardIntentUseCaseService } from './confirm-stripe-card-intent.service';

@Injectable()
export class CardPaymentUseCaseService extends PaymentCommonService {

  constructor(
    private createStripeIntentUseCaseSrv: CreateStripeIntentUseCaseService,
    private confirmStripeCardIntentUseCaseSrv: ConfirmStripeCardIntentUseCaseService,
  ) {
    super();
  }

  async exec(
    cart: UnknownObjectType[],
    currentIso: string,
    amount: number,
    customerId: string,
    selectedPaymentId: string,
    name: string,
    newCardData?: INewCardData,
    card?: stripe.Card
  ): Promise<IOrderPayment> {
    this.setInnerLoader(true, true);

    await this.getCartAndValidate(cart, currentIso);

    const intent = await this.createStripeIntentUseCaseSrv.exec(PAYMENT_METHOD.CARD, amount, customerId, selectedPaymentId);
    const paymentIntent = await this.confirmStripeCardIntentUseCaseSrv.exec(intent, selectedPaymentId, name, newCardData);

    return {
      type: PAYMENT_METHOD.CARD,
      card: newCardData ? paymentIntent.payment_method : card,
      intent: paymentIntent
    };
  }
}
