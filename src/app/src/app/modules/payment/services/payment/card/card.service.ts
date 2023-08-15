import { Injectable } from '@angular/core';

@Injectable()
export class PaymentCardService {
  // public async createOrder(stripeIntent: stripe.paymentIntents.PaymentIntent | null): Promise<string> {
  //   const buttonId = this.checkoutCommonSrv.generateButtonId();
  //   const orderId = await this.createOrderHandler(stripeIntent, buttonId);

  //   return orderId;
  // }

  // public async confirmPaymentIntent(
  //   id: string,
  //   stripeIntent: stripe.paymentIntents.PaymentIntent
  // ): Promise<{ paymentIntent?: stripe.paymentIntents.PaymentIntent; error?: stripe.Error }> {
  //   const confirmation = await this.confirmPaymentIntentHandler(id, stripeIntent);

  //   return confirmation;
  // }

  // public async getNewCardPaymentId(params: INewCard, paymentIntent: stripe.paymentIntents.PaymentIntent): Promise<string> {
  //   const buttonId = this.checkoutCommonSrv.generateButtonId();
  //   const orderId = await this.getNewCardPaymentIdHandler(params, paymentIntent, buttonId);

  //   return orderId;
  // }

  // public async addAndPay(params: INewCard): Promise<Promise<stripe.paymentIntents.PaymentIntent>> {
  //   const paymentIntent = await this.onAddAndPayHandler(params);

  //   return paymentIntent;
  // }

  // private async createOrderHandler(stripeIntent: stripe.paymentIntents.PaymentIntent | null, buttonId?: string): Promise<string> {
  //   const cart = await this.checkoutCommonSrv.getCartAndValidate(this.checkoutStoreSrv.currentIso);
  //   const selectedPaymentMethod = this.checkoutStoreSrv.selectedPaymentMethodFullValue;
  //   const paymentId = await this.createOrderWithCardPaymentMethod(cart, selectedPaymentMethod?.source?.id, stripeIntent, buttonId);

  //   return paymentId;
  // }

  // private async createOrderWithCardPaymentMethod(
  //   cart: any,
  //   id: string,
  //   stripeIntent: stripe.paymentIntents.PaymentIntent,
  //   buttonId?: string
  // ): Promise<string> {
  //   const { paymentIntent, error } = await this.confirmPaymentIntent(id, stripeIntent);

  //   if (error) {
  //     this.checkoutStoreSrv.setSelectedPaymentMethod(null);

  //     const stripeErrorMsg = await this.stripeSrv.getPublicErrorMessage(error);

  //     throw new PurchaseError({
  //       name: 'CARD_ERROR',
  //       message: 'Confirm payment intent error',
  //       cause: error,
  //       displayErrorMessage: stripeErrorMsg,
  //       data: {
  //         stripeIntent,
  //       },
  //     });
  //   } else if (paymentIntent) {
  //     this.checkoutCommonSrv.logInfo(PAYMENT_METHOD.CARD, 'Confirm payment intent success');

  //     const paymentId = await this.generateCardOrder(cart, paymentIntent, buttonId, this.checkoutStoreSrv.selectedPaymentMethod.source);

  //     return paymentId;
  //   } else {
  //     throw new PurchaseError({
  //       name: 'CARD_ERROR',
  //       message: 'No card payment intent on confirm',
  //       data: {
  //         stripeIntent,
  //       },
  //     });
  //   }
  // }

  // private async confirmPaymentIntentHandler(
  //   id: string,
  //   stripeIntent: stripe.paymentIntents.PaymentIntent
  // ): Promise<{ paymentIntent?: stripe.paymentIntents.PaymentIntent; error?: stripe.Error }> {
  //   const { stripeIntentStatuses } = this.checkoutCommonSrv;

  //   if ([stripeIntentStatuses.reqConfirmation, stripeIntentStatuses.reqAction].includes(stripeIntent.status)) {
  //     return await this.stripe.confirmCardPayment(stripeIntent.client_secret, {
  //       setup_future_usage: environment.stripe.usage,
  //     });
  //   } else if (stripeIntent.status === stripeIntentStatuses.reqPaymentMethod) {
  //     return await this.stripe.confirmCardPayment(stripeIntent.client_secret, {
  //       setup_future_usage: environment.stripe.usage,
  //       payment_method: {
  //         card: id,
  //         billing_details: {
  //           name: this.checkoutStoreSrv.stripeRef.name,
  //         },
  //       },
  //     });
  //   } else {
  //     throw new PurchaseError({
  //       name: 'CARD_ERROR',
  //       message: `${PAYMENT_METHOD.CARD} invalid payment intent status`,
  //       data: {
  //         stripeIntent,
  //       },
  //     });
  //   }
  // }

  // public getPaymentMethod(cardData: { name: string; card: any }): any {
  //   return this.stripe.createPaymentMethod({
  //     type: PAYMENT_METHOD.CARD,
  //     card: cardData.card,
  //     billing_details: {
  //       name: cardData.name,
  //     },
  //   });
  // }

  // private async generateCardOrder(
  //   cart: any,
  //   paymentIntent: stripe.paymentIntents.PaymentIntent,
  //   buttonId: string,
  //   selectedPaymentMethodSource?: any
  // ): Promise<string> {
  //   const orderPaymentMethod = {
  //     type: PAYMENT_METHOD.CARD,
  //     intent: paymentIntent,
  //     card: selectedPaymentMethodSource || paymentIntent.payment_method,
  //   };

  //   const paymentId = await this.checkoutCommonSrv.generateOrder(cart, orderPaymentMethod, buttonId);

  //   return paymentId;
  // }

  // private async getNewCardPaymentIdHandler(
  //   { data }: INewCard,
  //   paymentIntent: stripe.paymentIntents.PaymentIntent,
  //   buttonId: string
  // ): Promise<string> {
  //   const cart = await this.checkoutCommonSrv.getCartAndValidate(this.checkoutStoreSrv.currentIso);

  //   if (paymentIntent.client_secret) {
  //     const confirmCardPaymentData = this.getConfirmCardPaymentData(data);
  //     const confirmCardPaymentRes = await this.checkoutCommonSrv.getStripe().confirmCardPayment(
  //       paymentIntent.client_secret,
  //       confirmCardPaymentData
  //     );

  //     if (confirmCardPaymentRes?.paymentIntent) {
  //       this.checkoutCommonSrv.logInfo(PAYMENT_METHOD.CARD, 'Confirm payment intent with new card success');

  //       const orderId = await this.generateCardOrder(cart, confirmCardPaymentRes?.paymentIntent, buttonId);

  //       return orderId;
  //     } else if (confirmCardPaymentRes?.error) {
  //       const stripeErrorMsg = await this.stripeSrv.getPublicErrorMessage(confirmCardPaymentRes.error);

  //       throw new PurchaseError({
  //         name: 'CARD_ERROR',
  //         message: 'Confirm payment intent with new card error',
  //         cause: confirmCardPaymentRes.error,
  //         displayErrorMessage: stripeErrorMsg,
  //       });
  //     }
  //   }
  // }

  // private async onAddAndPayHandler({ currency }: INewCard): Promise<stripe.paymentIntents.PaymentIntent> {
  //   try {
  //     const paymentIntent = await this.checkoutStripeIntentsControllerSrv.getCardPaymentIntent(currency);

  //     this.checkoutCommonSrv.logInfo(PAYMENT_METHOD.CARD, 'Create stripe intent with new card success');

  //     return paymentIntent;
  //   } catch (err) {
  //     throw new PurchaseError({
  //       name: 'CARD_ERROR',
  //       message: 'Card payment intent error on add and pay',
  //       cause: err,
  //     });
  //   }
  // }

  // private getConfirmCardPaymentData({ card, name }: INewCardData): any {
  //   return {
  //     setup_future_usage: 'off_session', // TODO: This could be variable
  //     payment_method: {
  //       card,
  //       billing_details: {
  //         name,
  //       },
  //     },
  //   };
  // }
}
