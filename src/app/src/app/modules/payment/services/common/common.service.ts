import { Injectable, inject } from '@angular/core';
import { UnknownObjectType } from '../../../../interfaces';
import { GenericPopupComponent } from '../../../../popups/generic-popup';
import { StatusPopupComponent } from '../../../../popups/status-popup';
import { PopupService } from '../../../../services/popup';
import {
  CartsService,
  EventService,
  LoaderService,
  LoggerService,
  PurchaseService,
  StorageService,
  TextService,
  UserService,
} from '../../../../services';
import { PaymentError } from '../../models/error.model';

@Injectable()
export class PaymentCommonService {
  loaderSrv = inject(LoaderService);
  eventSrv = inject(EventService);
  userService = inject(UserService);
  purchaseSrv = inject(PurchaseService);
  cartsSrv = inject(CartsService);
  popupSrv = inject(PopupService);
  textSrv = inject(TextService);
  loggerSrv = inject(LoggerService);
  storageSrv = inject(StorageService);

  setLoading(set: boolean): void {
    this.loaderSrv.setLoading(set);
  }

  setInnerLoader(set: boolean, page: boolean): void {
    this.eventSrv.dispatchEvent('loading-animation', { set, isPage: page });
  }

  async getCartAndValidate(cart: any, iso: string): Promise<UnknownObjectType[]> {
    const formattedCart: any = this.purchaseSrv.formatCart(cart);
    const { isValidCart, validError } = await this.purchaseSrv.validateCart(formattedCart, iso);

    if (isValidCart) {
      return formattedCart;
    }

    throw new PaymentError({
      name: 'CART_ERROR',
      message: validError || 'Validate cart error',
    });
  }

  displayGenericPopUp(id: string, msg: string = 'Operation not available'): any {
    return this.popupSrv.open(GenericPopupComponent, { data: { id, msg: this.translate(msg) } });
  }

  displayStatusPopup(err: boolean, msgError: string = 'Operation not available'): any {
    return this.popupSrv.open(StatusPopupComponent, { data: { err, msgError: this.translate(msgError) } });
  }

  translate(text: string): string {
    return this.textSrv.getText(text);
  }

  // saveLastPayment(cart: UnknownObjectType[], purchase?: IStorageLastPaymentPurchase): void {
  //   const { products, price, creditsToSpend, lastPaymentIntent } = this.checkoutStoreSrv;

  //   const lastPaymentData: IStorageLastPayment = {
  //     products,
  //     cart,
  //     address: this.checkoutStoreSrv.getSelectedUserAddress(),
  //     price,
  //     ...(lastPaymentIntent?.id && { paymentIntentId: lastPaymentIntent.id }),
  //     ...(purchase?.payment?.stripeId && { stripeId: purchase.payment.stripeId }),
  //     ...(purchase && { purchase }),
  //     ...(creditsToSpend && { usedCredits: creditsToSpend }),
  //   };

  //   this.storageSrv.set('lastPayment', lastPaymentData);
  // }

  logInfo(msgContext: string, message: string, data?: UnknownObjectType): void {
    this.loggerSrv.log(`[${msgContext}] - ${message}`, { context: 'purchase', ...(data && { data }) });
  }

  logError(error: any, message?: string): void {
    const paymentError = this.mapError(error, message);

    this.loggerSrv.error(paymentError.message, paymentError);
  }

  private mapError(error: any, message?: string): PaymentError {
    if (error instanceof PaymentError) {
      if (error?.displayErrorMessage) {
        const { displayErrorMessage, ...errorWithoutDisplayErrorMessageKey } = error;

        error = errorWithoutDisplayErrorMessageKey;
      }

      return {
        ...error,
        ...(message && { message }),
      };
    } else {
      return new PaymentError({
        name: 'UNEXPECTED_ERROR',
        message: message || error?.message || 'Something to fix',
        cause: error,
      });
    }
  }
}
