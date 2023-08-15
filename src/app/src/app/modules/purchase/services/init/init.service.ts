import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, first, map, pairwise } from 'rxjs/operators';
import { IAddress, UserInterface } from '../../../../interfaces';
import { PAYMENT_METHOD } from '../../../../modules/purchase/constants/payment-method.constants';
import {
  CartsService,
  CountryService,
  EventService,
  LoaderService,
  LoggerService,
  PurchaseService,
  StorageService,
  StripeService,
  TextService,
  UserService,
} from '../../../../services';
import { PopupService } from '../../../../services/popup';
import { StateService } from '../../../../services/state/state.service';
import { CheckoutAnalyticsService } from '../analytics/analytics.service';
import { CheckoutService } from '../checkout/checkout.service';
import { CheckoutCommonService } from '../common/common.service';
import { CheckoutStripeCallbacksControllerService } from '../controllers';
import { CheckoutGroupOrderService } from '../group-order/group-order.service';
import { CheckoutPaymentCommonService } from '../payment';
import { CheckoutProductsService } from '../products/checkout-products.service';
import { CheckoutStoreService } from '../store/checkout-store.service';
import { CheckoutNavigationService } from '../navigation/navigation.service';
import { CheckoutHelpersService } from '../helpers/helpers.service';
import { CheckoutHandlersService } from '../handlers/handlers.service';

@Injectable()
export class CheckoutInitService extends CheckoutCommonService {
  private stripeLoadedSubscription = new Subscription();

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
    private stripeSrv: StripeService,
    private activatedRoute: ActivatedRoute,
    private countrySrv: CountryService,
    private stateSrv: StateService,
    private checkoutSrv: CheckoutService,
    private checkoutProductsSrv: CheckoutProductsService,
    private checkoutPaymentCommonSrv: CheckoutPaymentCommonService,
    private checkoutGroupOrderSrv: CheckoutGroupOrderService,
    private checkoutAnalyticsSrv: CheckoutAnalyticsService,
    private checkoutNavigationSrv: CheckoutNavigationService,
    private checkoutHandlersSrv: CheckoutHandlersService,
    private checkoutHelpersSrv: CheckoutHelpersService,
    private checkoutStripeCallbacksSrv: CheckoutStripeCallbacksControllerService,
  ) {
    super(loaderSrv, eventSrv, userService, purchaseSrv, cartsSrv, popupSrv, textSrv, loggerSrv, storageSrv, checkoutStoreSrv);
  }

  checkProductsAndInit(): void {
    const hasProducts = this._checkCartProducts();

    hasProducts ? this.initPurchaseProcess() : this._initPurchaseProcessWithoutProducts();
  }

  initPurchaseProcess(goHash?: string): void {
    if (this.checkoutPaymentCommonSrv.hasStripe()) {
      void this._afterStripeInit(goHash);
    } else {
      if (this.stripeSrv.get()) {
        this.checkoutPaymentCommonSrv.setStripe(this.stripeSrv.get());
        void this._afterStripeInit(goHash);
      } else {
        this.stripeSrv.init();
        this.stripeLoadedSubscription = this.stripeSrv.loadedStripeSub.subscribe((isStripeLoaded) => {
          if (isStripeLoaded) {
            this.stripeLoadedSubscription.unsubscribe();
            this.checkoutPaymentCommonSrv.setStripe(this.stripeSrv.get());
            void this._afterStripeInit(goHash);
          }
        });
      }
    }
  }

  private _initPurchaseProcessWithoutProducts(): void {
    this.checkoutStoreSrv.setIsPageLoaded(true);
    this.checkoutStoreSrv.products$
      .pipe(
        pairwise(),
        map(([prev, current]) => ({ prev: prev.length, current: current.length })),
        first(({ prev, current }) => prev === 0 && current > prev)
      )
      .subscribe(() => {
        this.initPurchaseProcess();
      });
  }

  private _checkCartProducts(): boolean {
    if (this.cartsSrv.get()?.length) {
      return true;
    } else {
      this.setLoading(false);
      this.setInnerLoader(false, false);

      return false;
    }
  }

  private async _afterStripeInit(goHash?: string): Promise<void> {
    if (this.checkoutStripeCallbacksSrv.checkStripeQueryParams()) {
      await this._initStripeCallback(goHash);
    } else {
      if (goHash) {
        await this._initGOGuestCheckout();
        await this.checkoutGroupOrderSrv.initGuestPaymentSection(goHash);
      } else {
        await this._initCheckout(true);
        this._onPageLoaded();
      }
    }
  }

  private async _initStripeCallback(goHash?: string): Promise<void> {
    const { key, type, error } = await this.checkoutStripeCallbacksSrv.initFromStripeCallback(goHash);

    if (key === PAYMENT_METHOD.IDEAL && type === 'success') {
      await this._initCheckout();
      this._onPageLoaded();
    } else if ([PAYMENT_METHOD.PAYPAL, PAYMENT_METHOD.KLARNA].includes(key) && type === 'error') {
      await this._onStripeCallbackRedirectError();
    }

    if (type === 'error') {
      this.displayStatusPopup(true, error?.displayErrorMessage);
      this.logError(error);
    }
  }

  private async _onStripeCallbackRedirectError(): Promise<void> {
    await this.checkoutNavigationSrv.navToCheckoutSection(2);
    await this._afterStripeInit();
  }

  private _onPageLoaded(): void {
    this._initSubscriptions();
    this.checkoutStoreSrv.setIsPageLoaded(true);
    this.setLoading(false);
    this.setInnerLoader(false, false);
  }

  private async _initCheckout(initConfig?: boolean): Promise<void> {
    const countryIso = this.countrySrv.getCountry();

    this.checkoutStoreSrv.setCurrentIso(countryIso);

    await this._setCountriesByIsoOnStore();
    await this._initUserData();

    if (initConfig) {
      await this._initConfig();
      await this.checkoutHelpersSrv.checkAndSetCredits();
    }

    await this._initProducts();
  }

  private async _initProducts(): Promise<void> {
    await this.checkoutProductsSrv.init();
    this.checkoutStoreSrv.setHasUnavailableProducts(this.checkoutProductsSrv.checkProductsAvailability(this.checkoutStoreSrv.products));
    await this._checkMSSingleBoxes();
    await this._checkQueryParams();
    this._initSectionQueryParamOnChangeHandler();

    if (this.checkoutStoreSrv.hasUnavailableProducts && this.checkoutStoreSrv.sectionQuery !== 'cart') {
      await this.checkoutNavigationSrv.navToCheckoutSection(0);
    }
  }

  private async _initGOGuestCheckout(): Promise<void> {
    await this._setCountriesByIsoOnStore();
    const countryIso = this.countrySrv.getCountry();

    this.checkoutStoreSrv.setCurrentIso(countryIso);
    await this._initUserData();
  }

  private async _initConfig(): Promise<void> {
    await this._initGroupOrderConfig();
    await this._initCreditsConfig();
    await this._initProductSubscriptionConfig();
    await this._initProductGiftConfig();
  }

  private async _initGroupOrderConfig(): Promise<void> {
    const isGroupOrderAvailable = await this.stateSrv
      .isGroupOrderAvailable()
      .pipe(first((res) => typeof res === 'boolean'))
      .toPromise();

    this.checkoutStoreSrv.setIsGroupOrderAvailable(isGroupOrderAvailable);
    this.checkoutGroupOrderSrv.checkLocalStorage(isGroupOrderAvailable);

    if (this.checkoutStoreSrv.isGroupOrder || this.activatedRoute.snapshot.queryParams.isgo) {
      this.activatedRoute.snapshot.queryParams.isgo && (await this.checkoutGroupOrderSrv.setCart());
      this.checkoutGroupOrderSrv.handlePaymentMethods();
    }
  }

  private async _initCreditsConfig(): Promise<void> {
    const isCreditsAvailable = await this.stateSrv
      .isCreditsAvailable()
      .pipe(first((res) => typeof res === 'boolean'))
      .toPromise();

    this.checkoutStoreSrv.setIsCreditsAvailable(isCreditsAvailable);
  }

  private async _initProductSubscriptionConfig(): Promise<void> {
    const isSubscriptionAvailable = await this.stateSrv
      .isSubscriptionAvailable()
      .pipe(first((res) => typeof res === 'boolean'))
      .toPromise();

    this.checkoutStoreSrv.setIsProductSubscriptionAvailable(isSubscriptionAvailable);
  }

  private async _initProductGiftConfig(): Promise<void> {
    const isGiftAvailable = await this.stateSrv
      .isProductGiftAvailable()
      .pipe(first((res) => typeof res === 'boolean'))
      .toPromise();

    this.checkoutStoreSrv.setIsProductGiftAvailable(isGiftAvailable);
  }

  private _initSectionQueryParamOnChangeHandler(): void {
    this.checkoutStoreSrv.subscriptions.add(
      this.activatedRoute.queryParams
        .pipe(
          filter((res) => !!res && res.section),
          map((res) => res.section)
        )
        .subscribe((section) => {
          this.stateSrv.setShowHeaderNavigation(section === 'cart');
          const sectionIdx = this.checkoutStoreSrv.sections.findIndex((elem) => elem.path === section);

          this.checkoutStoreSrv.setCurrentSectionIdx(sectionIdx);
          this.checkoutAnalyticsSrv.trackProductsAnalytics(`${sectionIdx + 1}`);
          this.checkoutAnalyticsSrv.trackGA4Analytics(`${sectionIdx + 1}`);
          this.checkoutSrv.updateCart(sectionIdx);
        })
    );
  }

  private async _initUserData(): Promise<void> {
    try {
      const user = await this.checkoutSrv.getUser();

      if (user) {
        this.checkoutStoreSrv.setIsUserLogged(true);
        this.checkoutStoreSrv.setUser(user);
        const userAddresses: IAddress[] = user.addresses || [];

        this.checkoutStoreSrv.setUserAddresses(userAddresses);

        if (!this.checkoutStoreSrv.selectedUserAddressId && userAddresses.length) {
          await this._checkUserAddressesOnInit(user);
        }

        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { card, ideal, paypal, sepa } = this.checkoutStoreSrv.allowedPaymentMethods;

        if (Object.values({ card, ideal, paypal, sepa }).every((elem) => elem === false)) {
          await this.checkoutSrv.setAllowedPaymentMethods();
        }

        if (user.paymentMethods && user.paymentMethods.length) {
          this.checkoutPaymentCommonSrv.setPaymentMethods();
          this.checkoutSrv.checkUserPaymentMethodsOnInit(user);
        }
      }
    } catch (err) {
      this.checkoutStoreSrv.setIsUserLogged(false);
    }
  }

  private async _checkUserAddressesOnInit(user: UserInterface): Promise<void> {
    const userAddresses: IAddress[] = user.addresses || [];
    const favUserAddress = userAddresses.find((elem) => elem.favourite);
    const currentCountryAddress = userAddresses.find((elem) => elem.country === this.countrySrv.getCountry());

    if (favUserAddress) {
      const favUserAddressCountry = favUserAddress.country;

      if (favUserAddressCountry !== this.countrySrv.getCountry()) {
        await this._matchCurrentCountryWithUserAddress(currentCountryAddress || favUserAddress);
      } else {
        this.checkoutStoreSrv.setSelectedUserAddressId(favUserAddress.id as string);
      }
    } else if (currentCountryAddress) {
      await this._matchCurrentCountryWithUserAddress(currentCountryAddress);
    }
  }

  private async _checkMSSingleBoxes(): Promise<void> {
    if (this.checkoutStoreSrv.hasMSSingleBoxesProducts) {
      try {
        await this.getCartAndValidate(this.checkoutStoreSrv.currentIso);
      } catch (err) {
        this.checkoutStoreSrv.setInvalidShipmentCountry(true);
        this.displayGenericPopUp('order-error', err?.displayErrorMessage).onClose.subscribe(() => this.checkoutHandlersSrv.openLocation());
      }
    }
  }

  private async _checkQueryParams(): Promise<void> {
    if (!this.checkoutStoreSrv.sectionQuery) {
      await this.checkoutNavigationSrv.navToCheckoutSection(0);
    } else {
      this.checkoutStoreSrv.setCurrentSectionIdx(
        this.checkoutStoreSrv.sections.findIndex((elem) => elem.path === this.checkoutStoreSrv.sectionQuery)
      );
    }
  }

  private async _setCountriesByIsoOnStore(): Promise<void> {
    const countriesByIso = await this.countrySrv.getCountriesByISO();

    this.checkoutStoreSrv.setCountriesByIso(countriesByIso);
  }

  private async _matchCurrentCountryWithUserAddress(matchAddress: IAddress): Promise<void> {
    const addressToSelectIso = matchAddress.country;

    if (this.checkoutStoreSrv.hasMSSingleBoxesProducts) {
      try {
        await this.checkoutSrv.getCartAndValidate(addressToSelectIso);
        await this._setMatchUserAddress(addressToSelectIso, matchAddress);
      } catch (err) {
        this.displayGenericPopUp('order-error', err?.displayErrorMessage);
      }
    } else {
      await this._setMatchUserAddress(addressToSelectIso, matchAddress);
    }
  }

  private async _setMatchUserAddress(addressToSelectIso: string, matchAddress: IAddress): Promise<void> {
    if (addressToSelectIso !== this.checkoutStoreSrv.currentIso) {
      await this.checkoutHandlersSrv.setAddressCountryIso(addressToSelectIso);
    }

    this.checkoutStoreSrv.setSelectedUserAddressId(matchAddress.id as string);
  }

  private _initSubscriptions(): void {
    this._subscribeToCountryChanges();
    this._initProductsSubscription();
    this._initPurchaseErrorItemsSubscription();
    this._initIsGroupOrderSubscription();
  }

  private _subscribeToCountryChanges(): void {
    this.checkoutStoreSrv.subscriptions.add(
      this.stateSrv.$currentCountry.pipe(
        filter(() => this.checkoutStoreSrv.isPageLoaded)
      ).subscribe(() => {
        void this.checkoutHandlersSrv.beforeChangeCountryCheck();
      })
    );
  }

  private _initProductsSubscription(): void {
    this.checkoutStoreSrv.subscriptions.add(
      this.checkoutStoreSrv.products$.pipe(
        filter(() => this.checkoutStoreSrv.isPageLoaded)
      ).subscribe((products) => {
        this.checkoutStoreSrv.setHasUnavailableProducts(this.checkoutProductsSrv.checkProductsAvailability(products));
      })
    );
  }

  private _initPurchaseErrorItemsSubscription(): void {
    this.checkoutStoreSrv.subscriptions.add(
      this.checkoutStoreSrv.purchaseErrorItems$.pipe(
        filter(() => this.checkoutStoreSrv.isPageLoaded)
      ).subscribe((productsUps) => {
        this.checkoutProductsSrv.purchaseErrorProductsHandler(productsUps);
      })
    );
  }

  private _initIsGroupOrderSubscription(): void {
    this.checkoutStoreSrv.subscriptions.add(
      this.checkoutStoreSrv.isGroupOrder$.pipe(
        filter(() => this.checkoutStoreSrv.isPageLoaded)
      ).subscribe((isGroupOrder) => {
        this.checkoutProductsSrv.setProductsInfoTotalData(this.checkoutStoreSrv.productsInfoTotal, isGroupOrder);
      })
    );
  }
}
