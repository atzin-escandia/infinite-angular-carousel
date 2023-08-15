import { Injectable } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { IAddress, IStripeCallbackRedirectParams } from '@app/interfaces';
import { PAYMENT_METHOD } from '@app/modules/purchase/constants/payment-method.constants';
import { PurchaseError } from '@app/modules/purchase/models/error.model';
import { StatusPopupComponent } from '@app/popups/status-popup';
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
import { PopupService } from '@app/services/popup';
import { CheckoutService } from '../../checkout/checkout.service';
import { CheckoutCommonService } from '../../common/common.service';
import { CheckoutHandlersService } from '../../handlers/handlers.service';
import { CheckoutHelpersService } from '../../helpers/helpers.service';
import { CheckoutNavigationService } from '../../navigation/navigation.service';
import { CheckoutPaymentCommonService } from '../../payment';
import { CheckoutProductsService } from '../../products/checkout-products.service';
import { CheckoutStoreService } from '../../store/checkout-store.service';

@Injectable()
export class CheckoutStripeCallbacksControllerService extends CheckoutCommonService {
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
    private activatedRoute: ActivatedRoute,
    private checkoutSrv: CheckoutService,
    private checkoutProductsSrv: CheckoutProductsService,
    private checkoutNavigationSrv: CheckoutNavigationService,
    private checkoutPaymentCommonSrv: CheckoutPaymentCommonService,
    private checkoutHandlersSrv: CheckoutHandlersService,
    private checkoutHelpersSrv: CheckoutHelpersService
  ) {
    super(loaderSrv, eventSrv, userService, purchaseSrv, cartsSrv, popupSrv, textSrv, loggerSrv, storageSrv, checkoutStoreSrv);
  }

  checkStripeQueryParams(): { key: PAYMENT_METHOD; queryParams: Params } {
    const queryParams = this.activatedRoute.snapshot.queryParams;

    if (queryParams.section && queryParams.section === 'payment' && Object.keys(queryParams).length > 1) {
      // eslint-disable-next-line unused-imports/no-unused-vars-ts
      const { section, ...queryParamsWithoutSection } = queryParams;

      if (this._comesFromIdeal(queryParamsWithoutSection)) {
        return { key: PAYMENT_METHOD.IDEAL, queryParams: queryParamsWithoutSection };
      } else if (this._comesFromPaypal(queryParams)) {
        return { key: PAYMENT_METHOD.PAYPAL, queryParams: queryParamsWithoutSection };
      } else if (this._comesFromKlarna(queryParams)) {
        return { key: PAYMENT_METHOD.KLARNA, queryParams: queryParamsWithoutSection };
      }
    }

    return null;
  }

  async initFromStripeCallback(goHash?: string): Promise<{ key: PAYMENT_METHOD; type: 'success' | 'error'; error?: any }> {
    if (!goHash) {
      this._handleLSOrderData();
      this.checkoutSrv.clearOrderDataAfterRedirectSuccess();
    }

    const paymentMethod = await this._handleStripeQueryParams();

    return paymentMethod;
  }

  private async _handleStripeQueryParams(): Promise<{ key: PAYMENT_METHOD; type: 'success' | 'error'; error?: any }> {
    const { key, queryParams } = this.checkStripeQueryParams();

    try {
      await this._onStripeCallback();

      if (key === PAYMENT_METHOD.IDEAL) {
        await this._handleStripeQueryParamsAsIdeal(queryParams);
      } else if (key === PAYMENT_METHOD.PAYPAL) {
        this._handleStripeQueryParamsAsPayPal(queryParams);
      } else if (key === PAYMENT_METHOD.KLARNA) {
        this._handleStripeQueryParamsAsKlarna(queryParams);
      }

      return { key, type: 'success' };
    } catch (err) {
      return { key, type: 'error', error: err };
    } finally {
      this.setInnerLoader(false, false);
    }
  }

  private _handleLSOrderData(): void {
    const { shipperMsg, dedicatoryMsg, selectedUserAddressId, usedCredits } = this.checkoutSrv.getLSOrderData();

    this.checkoutStoreSrv.setShipperMsg(shipperMsg && shipperMsg !== 'null' ? shipperMsg : null);
    this.checkoutStoreSrv.setDedicatoryMsg(dedicatoryMsg && dedicatoryMsg !== 'null' ? dedicatoryMsg : null);
    this.checkoutStoreSrv.setSelectedUserAddressId(selectedUserAddressId);
    this.checkoutStoreSrv.setCreditsToSpend(usedCredits);
  }

  private async _handleStripeQueryParamsAsIdeal(queryParams: Params): Promise<PAYMENT_METHOD> {
    await this._handleIdealCallback(queryParams);

    return PAYMENT_METHOD.IDEAL;
  }

  private _handleStripeQueryParamsAsPayPal(queryParams: Params): void {
    const isSucceeded = this._isOnRedirectSucceeded(queryParams, PAYMENT_METHOD.PAYPAL);

    if (isSucceeded) {
      this._onCallbackRedirectSuccess(queryParams as IStripeCallbackRedirectParams);
    } else {
      throw new PurchaseError({
        name: 'STRIPE_CALLBACK_ERROR',
        message: `${PAYMENT_METHOD.PAYPAL} redirect error`,
        data: {
          queryParams,
        },
      });
    }
  }

  private _handleStripeQueryParamsAsKlarna(queryParams: Params): void {
    const isSucceeded = this._isOnRedirectSucceeded(queryParams, PAYMENT_METHOD.KLARNA);

    if (isSucceeded) {
      this._onCallbackRedirectSuccess(queryParams as IStripeCallbackRedirectParams);
    } else {
      throw new PurchaseError({
        name: 'STRIPE_CALLBACK_ERROR',
        message: `${PAYMENT_METHOD.KLARNA} redirect error`,
        data: {
          queryParams,
        },
      });
    }
  }

  private _onCallbackRedirectSuccess({
    is_group_order,
    go_hash,
    payment_intent_client_secret,
    selected_payment_method_id,
    button_id,
  }: IStripeCallbackRedirectParams): void {
    const isGroupOrder = is_group_order === 'true';

    this.checkoutHandlersSrv.onRedirectHandler(isGroupOrder, {
      go_hash,
      payment_intent_client_secret,
      selected_payment_method_id,
      button_id,
    });
  }

  private async _handleIdealCallback(queryParams: Params): Promise<void> {
    const { redirect_status, profile_id, set_fav, setup_intent, setup_intent_client_secret } = queryParams;

    if (redirect_status === 'succeeded') {
      const confirmation: { result: string; idealConfirm: string } = await this.userService.confirmIdealAuth(
        profile_id,
        set_fav || 'false',
        redirect_status,
        setup_intent,
        setup_intent_client_secret
      );

      if (confirmation.result === 'ok') {
        this.checkoutPaymentCommonSrv.setPaymentMethods(confirmation.idealConfirm);
        await this.checkoutNavigationSrv.navToCheckoutSection(2);

        this.popupSrv.open(StatusPopupComponent, {
          data: {
            msgSuccess: this.textSrv.getText('Successfuly added {paymentMethod}', {
              '{paymentMethod}': PAYMENT_METHOD.IDEAL,
            }),
          },
        });

        const { paymentMethods } = this.checkoutStoreSrv.user;

        if (confirmation.idealConfirm && paymentMethods?.length) {
          const idealSource = paymentMethods[0]?.ideals?.find((elem) => elem.idealInfo.id === confirmation.idealConfirm);

          if (idealSource?.idealInfo) {
            this.checkoutStoreSrv.setSelectedPaymentMethod({
              type: PAYMENT_METHOD.IDEAL,
              source: idealSource?.idealInfo,
            });
          }
        }
      } else {
        throw new PurchaseError({
          name: 'STRIPE_CALLBACK_ERROR',
          message: `${PAYMENT_METHOD.IDEAL} confirmation error`,
          data: {
            queryParams,
          },
        });
      }
    } else {
      throw new PurchaseError({
        name: 'STRIPE_CALLBACK_ERROR',
        message: `${PAYMENT_METHOD.IDEAL} redirect error`,
        data: {
          queryParams,
        },
      });
    }
  }

  private async _onStripeCallback(): Promise<void> {
    const user = await this.checkoutSrv.getUser();

    if (user) {
      this.checkoutStoreSrv.setUser(user);
      this.checkoutStoreSrv.setIsUserLogged(true);
      this.checkoutStoreSrv.setUserAddresses(user.addresses || []);
      await this.checkoutHelpersSrv.checkAndSetCredits();
      await this.checkoutProductsSrv.init();
    } else {
      throw new Error('User is not logged in');
    }
  }

  private _isOnRedirectSucceeded(queryParams: Params, paymentMethod: PAYMENT_METHOD): boolean {
    const { payment_intent, redirect_status } = queryParams;
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const paypalCallbackUrlSnapshot = this.activatedRoute.snapshot['_routerState']?.url;

    paymentMethod === PAYMENT_METHOD.PAYPAL && this.checkoutPaymentCommonSrv.logPaypalCallback(payment_intent, paypalCallbackUrlSnapshot);

    if (redirect_status !== this.checkoutPaymentCommonSrv.stripeIntentStatuses.succeeded) {
      throw new PurchaseError({
        name: 'STRIPE_CALLBACK_ERROR',
        message: `${paymentMethod} invalid payment redirect status`,
        data: {
          queryParams,
        },
      });
    }

    return true;
  }

  private _comesFromIdeal(queryParams: Params): boolean {
    const idealRedirectQueryParams = ['profile_id', 'setup_intent', 'setup_intent_client_secret'];

    return idealRedirectQueryParams.every((elem) => Object.keys(queryParams).includes(elem));
  }

  private _comesFromPaypal(queryParams: Params): boolean {
    if (queryParams.payment_type === PAYMENT_METHOD.PAYPAL) {
      const paypalRedirectQueryParams = ['payment_intent', 'payment_intent_client_secret'];

      if (paypalRedirectQueryParams.every((elem) => Object.keys(queryParams).includes(elem))) {
        return true;
      } else {
        // eslint-disable-next-line @typescript-eslint/dot-notation
        this.checkoutPaymentCommonSrv.logMissingQueryparams(this.activatedRoute.snapshot['_routerState']?.url);
      }
    }

    return false;
  }

  private _comesFromKlarna(queryParams: Params): boolean {
    if (queryParams.payment_type === PAYMENT_METHOD.KLARNA) {
      const paypalRedirectQueryParams = ['payment_intent', 'payment_intent_client_secret'];

      if (paypalRedirectQueryParams.every((elem) => Object.keys(queryParams).includes(elem))) {
        return true;
      } else {
        // eslint-disable-next-line @typescript-eslint/dot-notation
        this.checkoutPaymentCommonSrv.logMissingQueryparams(this.activatedRoute.snapshot['_routerState']?.url);
      }
    }

    return false;
  }
}
