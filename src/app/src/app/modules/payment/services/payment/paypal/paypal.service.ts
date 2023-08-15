import { Injectable } from '@angular/core';

@Injectable()
export class PaymentPaypalService {
  // get stripe(): any {
  //   return this.checkoutPaymentCommonSrv.getStripe();
  // }

  // constructor(
  //   public loaderSrv: LoaderService,
  //   public eventSrv: EventService,
  //   public userService: UserService,
  //   public purchaseSrv: PurchaseService,
  //   public cartsSrv: CartsService,
  //   public popupSrv: PopupService,
  //   public textSrv: TextService,
  //   public loggerSrv: LoggerService,
  //   public storageSrv: StorageService,
  //   private stripeSrv: StripeService
  // ) {
  //   super(loaderSrv, eventSrv, userService, purchaseSrv, cartsSrv, popupSrv, textSrv, loggerSrv, storageSrv, checkoutStoreSrv);
  // }

  // async pay(stripeIntent: stripe.paymentIntents.PaymentIntent): Promise<void> {
  //   const buttonId = this.checkoutPaymentCommonSrv.generateButtonId();

  //   await this._stripeIntentHandler(stripeIntent, buttonId);
  // }

  // async createPaymentMethodAndPay(currency: CurrencyType): Promise<void> {
  //   const buttonId = this.checkoutPaymentCommonSrv.generateButtonId();

  //   this.checkoutPaymentCommonSrv.logInfo(PAYMENT_METHOD.PAYPAL, 'Create payment method');

  //   const { id } = await this._createPaymentMethod();

  //   if (id) {
  //     const stripeIntent = await this._getStripeIntent(currency, id);

  //     await this._stripeIntentHandler(stripeIntent, buttonId);
  //   } else {
  //     throw new PurchaseError({
  //       name: 'PAYPAL_ERROR',
  //       message: `${PAYMENT_METHOD.PAYPAL} no payment method id`,
  //     });
  //   }
  // }

  // async confirmGroupOrderPaymentIntent(
  //   stripeIntent: stripe.paymentIntents.PaymentIntent,
  //   goPurchaseId: string,
  //   goHash: string
  // ): Promise<void> {
  //   const buttonId = this.checkoutPaymentCommonSrv.generateButtonId();

  //   await this._stripeIntentHandler(stripeIntent, buttonId, goPurchaseId, goHash);
  // }

  // async createPaymentMethod(): Promise<string> {
  //   const { id } = await this._createPaymentMethod();

  //   return id;
  // }

  // private async _stripeIntentHandler(
  //   stripeIntent: stripe.paymentIntents.PaymentIntent,
  //   buttonId: string,
  //   goPurchaseId?: string,
  //   goHash?: string
  // ): Promise<void> {
  //   const { isGroupOrderGuestPaymentMode, currentIso } = this.checkoutStoreSrv;

  //   if (isGroupOrderGuestPaymentMode) {
  //     await this._checkStatusAndConfirm(stripeIntent, buttonId, goPurchaseId, goHash);
  //   } else {
  //     await this.checkoutPaymentCommonSrv.getCartAndValidate(currentIso);
  //     await this._checkStatusAndConfirm(stripeIntent, buttonId, goPurchaseId, goHash);
  //   }
  // }

  // private async _checkStatusAndConfirm(
  //   stripeIntent: stripe.paymentIntents.PaymentIntent,
  //   buttonId: string,
  //   goPurchaseId?: string,
  //   goHash?: string
  // ): Promise<void> {
  //   const { stripeIntentStatuses } = this.checkoutPaymentCommonSrv;
  //   const isValidIntentStatus = [stripeIntentStatuses.reqConfirmation, stripeIntentStatuses.reqAction].includes(stripeIntent.status);

  //   if (isValidIntentStatus) {
  //     await this._confirm(stripeIntent, buttonId, goPurchaseId, goHash);
  //   } else {
  //     throw new PurchaseError({
  //       name: 'PAYPAL_ERROR',
  //       message: `${PAYMENT_METHOD.PAYPAL} invalid payment intent status`,
  //       data: {
  //         stripeIntent,
  //       },
  //     });
  //   }
  // }

  // private async _confirm(
  //   stripeIntent: stripe.paymentIntents.PaymentIntent,
  //   buttonId: string,
  //   goPurchaseId?: string,
  //   goHash?: string
  // ): Promise<void> {
  //   const path = window.location.href;

  //   this.checkoutStoreSrv.isGroupOrder
  //     ? await this._confirmGroupOrderPayPal(stripeIntent, path, buttonId, goPurchaseId, goHash)
  //     : await this._confirmDefaultPayPal(stripeIntent, path, buttonId);
  // }

  // private async _confirmGroupOrderPayPal(
  //   stripeIntent: stripe.paymentIntents.PaymentIntent,
  //   path: string,
  //   buttonId: string,
  //   goPurchaseId: string,
  //   goHash: string
  // ): Promise<void> {
  //   const { paymentIntent, error } = await this.stripe.confirmPaymentIntent(stripeIntent.client_secret, {
  //     payment_method: stripeIntent.payment_method,
  //     return_url: this._getPayPalCallbackUrl(path, buttonId, goPurchaseId, goHash),
  //     mandate_data: {
  //       customer_acceptance: {
  //         type: 'online',
  //         online: {
  //           infer_from_client: true,
  //         },
  //       },
  //     },
  //   });

  //   if (paymentIntent) {
  //     window.location.href = paymentIntent.next_action.redirect_to_url.url;
  //   } else if (error) {
  //     const stripeErrorMsg = await this.stripeSrv.getPublicErrorMessage(error);

  //     throw new PurchaseError({
  //       name: 'PAYPAL_ERROR',
  //       message: `${PAYMENT_METHOD.PAYPAL} confirm payment intent error`,
  //       cause: error,
  //       displayErrorMessage: stripeErrorMsg,
  //       data: {
  //         stripeIntent,
  //       },
  //     });
  //   } else {
  //     throw new PurchaseError({
  //       name: 'PAYPAL_ERROR',
  //       message: `${PAYMENT_METHOD.PAYPAL} no payment intent`,
  //       data: {
  //         stripeIntent,
  //       },
  //     });
  //   }
  // }

  // private async _confirmDefaultPayPal(stripeIntent: stripe.paymentIntents.PaymentIntent, path: string, buttonId: string): Promise<void> {
  //   const cart = await this.checkoutPaymentCommonSrv.getCartAndValidate(this.checkoutStoreSrv.currentIso);
  //   const purchaseData = this.checkoutPaymentCommonSrv.getPurchaseData(cart);

  //   this.checkoutPaymentCommonSrv.logInfo(PAYMENT_METHOD.PAYPAL, 'Confirm payment intent');

  //   const { url } = await this.stripeSrv.confirmPaymentMethod({
  //     id: stripeIntent.id,
  //     url: this._getPayPalCallbackUrl(path, buttonId),
  //     mandate_type: 'offline',
  //     purchaseData,
  //   }, 'paypal');

  //   if (url) {
  //     this.saveLastPayment(cart);
  //     this.checkoutPaymentCommonSrv.logInfo(PAYMENT_METHOD.PAYPAL, 'Redirect to external url', { url });

  //     window.location.href = url;
  //   } else {
  //     throw new PurchaseError({
  //       name: 'PAYPAL_ERROR',
  //       message: `${PAYMENT_METHOD.PAYPAL} no callback url on confirm`,
  //       data: {
  //         stripeIntent,
  //       },
  //     });
  //   }
  // }

  // private _getPayPalCallbackUrl(path: string, buttonId: string, goPurchaseId?: string, goHash?: string): string {
  //   const selectedPaymentMethodId = this.checkoutStoreSrv.selectedPaymentMethod?.source?.id as string;
  //   const { isGroupOrder } = this.checkoutStoreSrv;

  //   let redirectUrl = `${path}&payment_type=${PAYMENT_METHOD.PAYPAL}&button_id=${buttonId}`;

  //   if (selectedPaymentMethodId) {
  //     redirectUrl = `${redirectUrl}&selected_payment_method_id=${selectedPaymentMethodId}`;
  //   }

  //   if (isGroupOrder && goPurchaseId && goHash) {
  //     redirectUrl = `${redirectUrl}&is_group_order=true&go_purchase_id=${goPurchaseId}&go_hash=${goHash}`;
  //   }

  //   return redirectUrl;
  // }

  // private async _createPaymentMethod(): Promise<any> {
  //   const paymentMethod = await this.stripeSrv.createPaymentMethod({
  //     card: {},
  //     type: PAYMENT_METHOD.PAYPAL,
  //   });

  //   return paymentMethod;
  // }

  // private async _getStripeIntent(currency: CurrencyType, currentPaymentId: string): Promise<stripe.paymentIntents.PaymentIntent> {
  //   this.checkoutPaymentCommonSrv.logInfo(PAYMENT_METHOD.PAYPAL, 'Create stripe intent');

  //   const intent: stripe.paymentIntents.PaymentIntent = await this.stripeSrv.getIntent({
  //     amount: this.checkoutStoreSrv.finalPrice,
  //     currency: currency.toLowerCase(),
  //     method: currentPaymentId,
  //     customer: this.checkoutStoreSrv.user.paymentMethods[0].id,
  //     savePaymentMethod: true,
  //     methodTypes: PAYMENT_METHOD.PAYPAL,
  //     shipping: this.checkoutPaymentCommonSrv.getStripeShippingDetails(),
  //   });

  //   return intent;
  // }
}
