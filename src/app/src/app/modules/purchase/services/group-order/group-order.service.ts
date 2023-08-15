import { Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import {
  IAllowedPaymentMethods,
  IGroupOrderConfirm,
  IPurchaseCart,
  IPurchaseCartItem,
  IPurchaseInfo,
  PurchaseCartType,
  UnknownObjectType,
} from '../../../../interfaces';
import { EventService, LoaderService, LoggerService, StorageService, StripeService, TextService } from '../../../../services';
import { PopupService } from '../../../../services/popup';
import { StateService } from '../../../../services/state/state.service';
import { CartsService, PurchaseService, GroupOrderService, RouterService, UserService } from '../../../../services';
import { PAYMENT_METHOD } from '../../constants/payment-method.constants';
import { CheckoutCommonService } from '../common/common.service';
import { CheckoutPaymentCardService } from '../payment/card/card.service';
import { CheckoutPaymentPaypalService } from '../payment/paypal/paypal.service';
import { CheckoutStoreService } from '../store/checkout-store.service';
import { PURCHASE_LS } from '../../constants/local-storage.constants';
import { PurchaseError } from '../../models/error.model';

@Injectable()
export class CheckoutGroupOrderService extends CheckoutCommonService {
  private _allowedPaymentMethods: IAllowedPaymentMethods = { card: true, paypal: true, sepa: false, ideal: false };
  private _availablePaymentMthods: PAYMENT_METHOD[] = [PAYMENT_METHOD.CARD, PAYMENT_METHOD.PAYPAL];

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
    public checkoutStoreSrv: CheckoutStoreService,
    private groupOrderSrv: GroupOrderService,
    private checkoutPaymentCardSrv: CheckoutPaymentCardService,
    private checkoutPaymentPaypalSrv: CheckoutPaymentPaypalService,
    private routerSrv: RouterService,
    private cartSrv: CartsService,
    private stateSrv: StateService,
    private stripeSrv: StripeService,
    private translocoSrv: TranslocoService
  ) {
    super(loaderSrv, eventSrv, userService, purchaseSrv, cartsSrv, popupSrv, textSrv, loggerSrv, storageSrv, checkoutStoreSrv);
  }

  async initGuestPaymentSection(hash: string): Promise<void> {
    this.stateSrv.setShowHeaderNavigation(false);
    this.checkoutStoreSrv.setIsGroupOrder(true);
    this.checkoutStoreSrv.setIsGroupOrderGuestPaymentMode(true);
    this._initGuestAvailablePaymentMethods();

    try {
      const user = await this.userService.get(true);

      this.checkoutStoreSrv.setUser(user);

      try {
        const purchaseInfo = await this.groupOrderSrv.getPurchaseInfoByHash(hash);

        await this._setGuestPaymentData(purchaseInfo);
      } catch (err) {
        this.routerSrv.navigate(`/`);
      } finally {
        this.setLoading(false);
        this.setInnerLoader(false, false);
      }
    } catch (err) {
      this.routerSrv.navigate('login-register', null, { rc: true, isgo: true, go: hash });
    } finally {
      this.setLoading(false);
      this.setInnerLoader(false, false);
    }
  }

  async getProducts(cartItems: IPurchaseCartItem[], country: string): Promise<UnknownObjectType[]> {
    const products = await this.cartSrv.productsInfo(
      cartItems.map((elem) => ({
        type: elem.type,
        _masterBox: elem.masterBox,
        _up: elem.up,
      })),
      country
    );

    return products.map((elem, i) => ({
      ...elem,
      price: cartItems[i].price.amount,
      numMasterBoxes: cartItems[i].numMasterBoxes,
      selectedDate: cartItems[i].selectedDate,
    }));
  }

  checkLocalStorage(isAvailable: boolean): void {
    this.checkoutStoreSrv.setIsGroupOrder(isAvailable ? localStorage.getItem(PURCHASE_LS.IS_GROUP_ORDER) === 'true' : false);
  }

  async setCart(): Promise<void> {
    try {
      const cart: IPurchaseCart = await this._getCart();

      cart && this.checkoutStoreSrv.setCart(cart);
    } catch (err) {
      if (err instanceof PurchaseError) {
        throw err;
      } else {
        throw new PurchaseError({
          name: 'GROUP_ORDER_ERROR',
          message: 'Group Order set cart error',
          cause: err,
        });
      }
    }
  }

  handlePaymentMethods(): void {
    this._setAllowedPaymentMethods();
    this._filterAvailablePaymentMethods();
  }

  async handleGroupOrderShipment(): Promise<IPurchaseCart> {
    const { currentIso } = this.checkoutStoreSrv;
    const items = this._getCartItems();

    try {
      const purchaseCart = await this.groupOrderSrv.updatePurchaseCart(this.checkoutStoreSrv.cart.id, {
        ...this.checkoutStoreSrv.cart,
        items,
        country: currentIso,
        address: {
          ...this.checkoutStoreSrv.getSelectedUserAddress(),
          gift: false,
        },
      });

      this.checkoutStoreSrv.setIsCartInvalid(false);

      return purchaseCart;
    } catch (err) {
      this.checkoutStoreSrv.setIsCartInvalid(true);
      const errMsg = this._handleError(err?.error, err?.message);

      throw new PurchaseError({
        name: 'GROUP_ORDER_ERROR',
        message: 'Group Order handle shipment error',
        cause: err,
        ...(errMsg && { displayErrorMessage: errMsg }),
      });
    }
  }

  handleGroupOrderOnPaymentSection(promoterAssumesPayment: boolean, guestsLimit: number): Promise<IPurchaseCart> {
    return this.groupOrderSrv.updatePurchaseCart(this.checkoutStoreSrv.cart.id, {
      ...this.checkoutStoreSrv.cart,
      promoterAssumesPayment,
      guestsLimit,
    });
  }

  async payCart(paymentMethodId: string, type: PAYMENT_METHOD): Promise<void> {
    try {
      const paymentIntentData = this.checkoutStoreSrv.isGroupOrderGuestPaymentMode
        ? await this._getPaymentIntentAsGuest(paymentMethodId, type)
        : await this._getPaymentIntentAsPromoter(paymentMethodId, type);

      if (paymentIntentData.paymentIntent) {
        const { id, hash } = paymentIntentData;
        const purchaseInfoId = id || this.checkoutStoreSrv.purchaseInfo.id;

        this._saveLocalGroupOrder(purchaseInfoId);

        if (type === PAYMENT_METHOD.PAYPAL) {
          await this._confirmPaymentIntent(paymentMethodId, type, paymentIntentData.paymentIntent, id, hash);
        } else {
          const { error, paymentIntent } = await this._confirmPaymentIntent(
            paymentMethodId,
            type,
            paymentIntentData.paymentIntent,
            id,
            hash
          );

          if (error) {
            const msg = await this.stripeSrv.getPublicErrorMessage(error);

            throw new PurchaseError({
              name: 'GROUP_ORDER_ERROR',
              message: 'Group Order confirm payment intent error',
              displayErrorMessage: msg,
            });
          } else if (paymentIntent) {
            this.onPayCartSuccess(hash || this.checkoutStoreSrv.purchaseInfo.hash);
          } else {
            throw new PurchaseError({
              name: 'GROUP_ORDER_ERROR',
              message: 'Group Order confirm payment intent error',
            });
          }
        }
      } else {
        throw new PurchaseError({
          name: 'GROUP_ORDER_ERROR',
          message: 'Group Order get payment intent error',
        });
      }
    } catch (err) {
      this._clearLocalGroupOrder();

      throw new PurchaseError({
        name: 'GROUP_ORDER_ERROR',
        message: 'Group Order pay cart error',
        cause: err,
      });
    }
  }

  async addPaymentMethodAndPayCart(cardData: { name: string; card: any }): Promise<void> {
    const { paymentMethod } = await this.checkoutPaymentCardSrv.getPaymentMethod(cardData);

    if (paymentMethod) {
      await this.payCart(paymentMethod.id, paymentMethod.type);
    } else {
      throw new PurchaseError({
        name: 'GROUP_ORDER_ERROR',
        message: 'Group Order without payment method',
      });
    }
  }

  onPayCartSuccess(hash: string): void {
    this.cartsSrv.clear();
    this.cartsSrv.update([], 'etc');
    this.routerSrv.navigate(`order/go-order-ok/${hash}`);
  }

  private _initGuestAvailablePaymentMethods(): void {
    const notAllowedPMs = [PAYMENT_METHOD.SEPA, PAYMENT_METHOD.IDEAL];
    const goAvailablePaymentMethods = this.checkoutStoreSrv.availablePaymentMethods.filter((elem) => !notAllowedPMs.includes(elem.type));

    this.checkoutStoreSrv.setAvailablePaymentMethods(goAvailablePaymentMethods);
    notAllowedPMs.includes(this.checkoutStoreSrv.selectedPaymentMethod?.type) && this.checkoutStoreSrv.setSelectedPaymentMethod(null);
  }

  private _saveLocalGroupOrder(purchaseId: string): void {
    this._clearLocalGroupOrder();
    const { isGroupOrderGuestPaymentMode, purchaseInfo, cart, user } = this.checkoutStoreSrv;
    const data: IGroupOrderConfirm = {
      purchaseId,
      ...(!isGroupOrderGuestPaymentMode && { crowdfarmerId: user._id }),
      cart: isGroupOrderGuestPaymentMode ? purchaseInfo.cart : cart,
    };

    this.storageSrv.set('groupOrder', data);
  }

  private _clearLocalGroupOrder(): void {
    this.storageSrv.clear('groupOrder');
  }

  private async _setGuestPaymentData(purchaseInfo: IPurchaseInfo): Promise<void> {
    const products = await this.getProducts(purchaseInfo.cart.items, purchaseInfo.country);

    this.checkoutStoreSrv.setPurchaseInfo(purchaseInfo);
    this._setGuestPaymentDataOnStore(products, purchaseInfo.totalToPay.amount);
  }

  private _setGuestPaymentDataOnStore(products: UnknownObjectType[], amount: number): void {
    this.checkoutStoreSrv.setProducts(products);
    this.checkoutStoreSrv.setPrice(amount);
    this.checkoutStoreSrv.setFinalPrice(amount);
    this.checkoutStoreSrv.setIsPageLoaded(true);
  }

  private _setAllowedPaymentMethods(): void {
    this.checkoutStoreSrv.setAllowedPaymentMethods(this._allowedPaymentMethods);
  }

  private _filterAvailablePaymentMethods(): void {
    const availablePaymentMethods = this.checkoutStoreSrv.availablePaymentMethods.filter((elem) =>
      this._availablePaymentMthods.includes(elem.type)
    );

    this.checkoutStoreSrv.setAvailablePaymentMethods(availablePaymentMethods);
  }

  private async _getCart(): Promise<IPurchaseCart> {
    try {
      const purchaseCart = await this.groupOrderSrv.getPurchaseCart();

      return purchaseCart;
    } catch (err) {
      if (err.error === 'PURCHASE_CART_NOT_FOUND') {
        try {
          const newGroupOrder = await this._createUserCart();

          return newGroupOrder;
        } catch (error) {
          throw new PurchaseError({
            name: 'GROUP_ORDER_ERROR',
            message: 'Group Order create cart error',
            cause: error,
          });
        }
      } else {
        throw new PurchaseError({
          name: 'GROUP_ORDER_ERROR',
          message: 'Group Order get cart error',
          cause: err,
        });
      }
    }
  }

  private _getCartItems(): IPurchaseCartItem[] {
    const cart = this.purchaseSrv.formatCart(this.cartsSrv.get());
    const { products } = this.checkoutStoreSrv;
    const cartItemsWithSelectedDate = cart.filter((elem) => elem.selectedDate);
    const cartItemsWithProductMbSelectedDate = cart
      .filter((elem) => !elem.selectedDate)
      .map((item) => ({
        ...item,
        selectedDate: products.find((elem) => elem._masterBox === item.masterBox)?.selectedDate,
      }));

    return [...cartItemsWithSelectedDate, ...cartItemsWithProductMbSelectedDate];
  }

  private async _createUserCart(): Promise<IPurchaseCart> {
    const type: PurchaseCartType = PurchaseCartType.GROUP;
    const items = this._getCartItems();
    const { currentIso } = this.checkoutStoreSrv;

    try {
      const newGroupOrder = await this.groupOrderSrv.createPurchaseCart({
        type,
        items,
        country: currentIso,
        guestsLimit: 1,
        promoterAssumesPayment: true,
      });

      return newGroupOrder;
    } catch (err) {
      const errMsg = this._handleError(err.error, err.message);

      throw errMsg ? new Error(errMsg) : err;
    }
  }

  private async _confirmPaymentIntent(
    id: string,
    type: PAYMENT_METHOD,
    paymentIntent: stripe.paymentIntents.PaymentIntent,
    goPurchaseId: string,
    goHash: string
  ): Promise<{
    paymentIntent?: stripe.paymentIntents.PaymentIntent;
    error?: stripe.Error;
  }> {
    if (type === PAYMENT_METHOD.CARD) {
      return this.checkoutPaymentCardSrv.confirmPaymentIntent(id, paymentIntent);
    } else if (type === PAYMENT_METHOD.PAYPAL) {
      await this.checkoutPaymentPaypalSrv.confirmGroupOrderPaymentIntent(paymentIntent, goPurchaseId, goHash);
    } else {
      throw new PurchaseError({
        name: 'GROUP_ORDER_ERROR',
        message: 'Unknown payment method type',
      });
    }
  }

  private async _getPaymentIntentAsGuest(
    paymentMethodId: string,
    type: PAYMENT_METHOD
  ): Promise<{
    id: string;
    paymentIntent: stripe.paymentIntents.PaymentIntent;
    hash: string;
  }> {
    const { id, paymentIntent, hash } = await this.groupOrderSrv.purchaseAsGuest(this.checkoutStoreSrv.purchaseInfo.id, {
      paymentMethod: {
        id: paymentMethodId,
        type,
        customer: this.checkoutStoreSrv.user.paymentMethods[0].id,
      },
    });

    return { id, paymentIntent, hash };
  }

  private async _getPaymentIntentAsPromoter(
    paymentMethodId: string,
    type: PAYMENT_METHOD
  ): Promise<{
    id: string;
    paymentIntent: stripe.paymentIntents.PaymentIntent;
    hash: string;
  }> {
    const { id, paymentIntent, hash } = await this.groupOrderSrv.purchase({
      cartId: this.checkoutStoreSrv.cart.id,
      paymentMethod: {
        id: paymentMethodId,
        type,
      },
    });

    return { id, paymentIntent, hash };
  }

  private _handleError(error: string, message: string): string {
    if (error === 'PURCHASE_CART_INVALID' && message.includes('Invalid selectedDate')) {
      return this.translocoSrv.translate('notifications.date-not-available-group-order.text-info');
    }
  }
}
