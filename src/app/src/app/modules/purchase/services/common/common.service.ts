import { Injectable } from '@angular/core';
import {
  UnknownObjectType,
  UserInterface,
  IStorageLastPayment,
  IStorageLastPaymentPurchase,
  IAllowedPaymentMethods,
} from '@app/interfaces';
import { GenericPopupComponent } from '@popups/generic-popup';
import { StatusPopupComponent } from '@popups/status-popup';
import { PopupService } from '@services/popup';
import {
  CartsService,
  EventService,
  LoaderService,
  LoggerService,
  PurchaseService,
  StorageService,
  TextService,
  UserService,
} from '@app/services';
import { PURCHASE_LS } from '../../constants/local-storage.constants';
import { CheckoutStoreService } from '../store/checkout-store.service';
import { PurchaseError } from '../../models/error.model';
import { PRODUCT_TYPE } from '@app/constants/product.constants';
import { IECProduct } from '@app/interfaces/product.interface';
import { EcommerceCartItem } from '@app/modules/e-commerce/interfaces/cart.interface';

@Injectable()
export class CheckoutCommonService {
  constructor(
    public loaderSrv: LoaderService,
    public eventSrv: EventService,
    public userService: UserService,
    public purchaseSrv: PurchaseService,
    public cartsSrv: CartsService,
    public popupSrv: PopupService,
    public textSrv: TextService,
    public loggerSrv: LoggerService,
    public storageSrv: StorageService,
    public checkoutStoreSrv: CheckoutStoreService
  ) {}

  setLoading(set: boolean): void {
    this.loaderSrv.setLoading(set);
  }

  setInnerLoader(set: boolean, page: boolean): void {
    this.eventSrv.dispatchEvent('loading-animation', { set, isPage: page });
  }

  getUser(): Promise<UserInterface> {
    return this.userService.get(true);
  }

  async getCartAndValidate(iso: string): Promise<UnknownObjectType[]> {
    const cart: UnknownObjectType[] = this.purchaseSrv.formatCart(this.cartsSrv.get());

    // Review EC: Review this logic (user can continue with an EC item error) ------------------
    const ecCartProductIdx = cart.findIndex((elem) => elem.type === PRODUCT_TYPE.ECOMMERCE);

    if (ecCartProductIdx >= 0) {
      const ecCartProduct = cart.find((elem) => elem.type === PRODUCT_TYPE.ECOMMERCE) as EcommerceCartItem;
      const ecProduct = this.checkoutStoreSrv.products.find((elem) => elem.type === PRODUCT_TYPE.ECOMMERCE) as IECProduct;
      const wrongProductItemsIds = [...new Set(ecProduct.errors.availability.map((elem) => elem.articles).flat())];

      cart[ecCartProductIdx] = {
        ...ecCartProduct,
        articles: ecCartProduct.articles.filter((elem) => !wrongProductItemsIds.includes(elem.id))
      };
    }
    // Review EC: Review this logic (user can continue with an EC item error) ------------------

    const { isValidCart, validError } = await this.purchaseSrv.validateCart(cart, iso);

    if (isValidCart) {
      return cart;
    }

    throw new PurchaseError({
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

  saveLastPayment(cart: UnknownObjectType[], purchase?: IStorageLastPaymentPurchase): void {
    const { products, price, creditsToSpend, lastPaymentIntent } = this.checkoutStoreSrv;

    const lastPaymentData: IStorageLastPayment = {
      products,
      cart,
      address: this.checkoutStoreSrv.getSelectedUserAddress(),
      price,
      ...(lastPaymentIntent?.id && {
        paymentIntentId: lastPaymentIntent.id,
        currency: lastPaymentIntent.currency,
        payment_method_types: lastPaymentIntent.payment_method_types as unknown as IAllowedPaymentMethods[],
        payment_method: lastPaymentIntent.payment_method,
      }),
      ...(purchase?.payment?.stripeId && { stripeId: purchase.payment.stripeId }),
      ...(purchase && { purchase }),
      ...(creditsToSpend && { usedCredits: creditsToSpend }),
    };

    this.storageSrv.set('lastPayment', lastPaymentData);
  }

  resetLocalStorage(): void {
    localStorage.removeItem(PURCHASE_LS.IS_GROUP_ORDER);
    localStorage.removeItem(PURCHASE_LS.IS_CROWDGIVING_ACTIVE);
  }

  logInfo(msgContext: string, message: string, data?: UnknownObjectType): void {
    this.loggerSrv.log(`[${msgContext}] - ${message}`, { context: 'purchase', ...(data && { data }) });
  }

  logError(error: any, message?: string): void {
    const purchaseError = this.mapError(error, message);

    this.loggerSrv.error(purchaseError.message, purchaseError);
  }

  private mapError(error: any, message?: string): PurchaseError {
    if (error instanceof PurchaseError) {
      if (error?.displayErrorMessage) {
        const { displayErrorMessage, ...errorWithoutDisplayErrorMessageKey } = error;

        error = errorWithoutDisplayErrorMessageKey;
      }

      return {
        ...error,
        ...(message && { message }),
      };
    } else {
      return new PurchaseError({
        name: 'UNEXPECTED_ERROR',
        message: message || error?.message || 'Something to fix',
        cause: error,
      });
    }
  }
}
