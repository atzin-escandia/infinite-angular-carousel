import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, first, map, mergeMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { KlarnaService } from '@app/services/klarna/klarna.service';
import { CheckoutSectionPathType } from '../../interfaces/checkout.interface';
import { CrossSellingService, LoggerService, RouterService, UtilsService } from '@app/services';
import { StateService } from '../../../../services/state/state.service';
import { ICheckoutSection } from '../../interfaces/checkout.interface';
import { IMsgCollapsableBox } from '../../interfaces/msg-collapsable-box.interface';
import { CheckoutShipmentSectionComponent } from './sections/shipment/checkout-shipment-section.component';
import { MsgKeyType } from '../../types/msg-key.types';
import { CheckoutService } from '../../services/checkout/checkout.service';
import { PurchaseCoreService } from '../../services/purchase.service';
import {
  INewCard,
  IAllowedPaymentMethods,
  ICrossSellingParams,
  ICrossSellingSpecifications,
  Seal,
} from '@app/interfaces';
import { CheckoutStoreKeyType } from '../../services';
import { CrossSellingBlockComponent } from '@app/components';
import { CROSS_SELLING_LOCATIONS, MAX_CROSS_SELLING_LIMIT } from '@app/constants/cross-selling.constants';
import { LINKS } from './checkout.constants';
import { IProductUpdateParams } from '../../interfaces/product.interface';
import {SealsService} from '@app/modules/e-commerce/services/seals-services';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
})
export class CheckoutPageComponent implements OnInit, OnDestroy {
  @ViewChild('shipmentSectionCmp') shipmentSectionCmp: CheckoutShipmentSectionComponent;
  @ViewChild('CSBlockCmp') CSBlockCmp: CrossSellingBlockComponent;

  private $klarnaConfig: Observable<{ active: boolean; advertising: boolean }>;

  public $isApplePayEnabled: Observable<boolean>;
  public $displayKlarnaAdvertising: Observable<boolean>;
  public $allowedPaymentMethods: Observable<IAllowedPaymentMethods>;
  public accepted18 = false;
  public warning18 = false;
  public shipperMsg: IMsgCollapsableBox = this.checkoutSrv.msgCollapsableBoxInit(35);
  public dedicatoryMsg: IMsgCollapsableBox = this.checkoutSrv.msgCollapsableBoxInit(500);
  public loadingProjects = true;
  public csParams: ICrossSellingParams = { limit: MAX_CROSS_SELLING_LIMIT };
  public csSpecifications: ICrossSellingSpecifications = this.purchaseCoreSrv.products.getCrossSellingSpecifications();
  public isCsActive = false;
  public isBrowserSafari = false;
  public links = LINKS;
  public seals: Seal[] = [];

  get activeSection(): ICheckoutSection {
    return this.getStoreData('sections').find((elem) => elem.path === this.purchaseCoreSrv.store.sectionQuery);
  }

  get $displayBreadcrumbs(): Observable<boolean> {
    return this.purchaseCoreSrv.store.isGroupOrderGuestPaymentMode$.pipe(map((res) => !res));
  }

  get $hasProducts(): Observable<boolean> {
    return this.purchaseCoreSrv.store.products$.pipe(map((res) => res?.length > 0));
  }

  constructor(
    private checkoutSrv: CheckoutService,
    private purchaseCoreSrv: PurchaseCoreService,
    private stateSrv: StateService,
    private loggerSrv: LoggerService,
    private activatedRoute: ActivatedRoute,
    private crossSellingSrv: CrossSellingService,
    private utilsSrv: UtilsService,
    private klarnaSrv: KlarnaService,
    public routerSrv: RouterService,
    public sealsSrv: SealsService,
  ) {}

  ngOnInit(): void {
    this.purchaseCoreSrv.common.setLoading(true);
    this.purchaseCoreSrv.common.setInnerLoader(true, true);
    this.loggerSrv.init();
    this.purchaseCoreSrv.store.init();
    this._initPageLoadedSubscription();
    this._initCoutryIsoSubscription();
    this._initCheckout();
    this.klarnaSrv.init();
    this._loadParamsFromFirebase();
    this._setIsBrowserSafari();
    this._setAllowedPaymentMethods();
    this._initSeals();
  }

  ngOnDestroy(): void {
    this.purchaseCoreSrv.store.unsubscribe();
    this.stateSrv.setShowHeaderNavigation(true);
    this.checkoutSrv.resetLocalStorage();
  }

  getStoreData(key: CheckoutStoreKeyType): Exclude<any, Observable<any>> {
    return this.purchaseCoreSrv.store[key];
  }

  getStoreDataObservable(key: CheckoutStoreKeyType): Observable<any> {
    return this.purchaseCoreSrv.store[key + '$'];
  }

  openLocationHandler(): void {
    this.purchaseCoreSrv.handlers.openLocation();
  }

  async removeCartProductHandler(idx: number): Promise<void> {
    await this.purchaseCoreSrv.controllers.cart.onRemoveProduct(idx);
  }

  async addCSProductHandler(): Promise<void> {
    await this.purchaseCoreSrv.controllers.cart.onAddCSProduct(this.CSBlockCmp);
  }

  async updateCartProductHandler(data: IProductUpdateParams & { idx: number }): Promise<void> {
    await this.purchaseCoreSrv.controllers.cart.onUpdateProduct(data);
  }

  changeSectionHandler(val: -1 | 1): void {
    void this.purchaseCoreSrv.handlers.changeSection(val);
  }

  onSelectedAddressChangeHandler(addressId: string): void {
    void this.purchaseCoreSrv.controllers.shipment.onSelectedAddressChange(addressId, this.shipmentSectionCmp);
  }

  addressesOnChangeHandler(selectedAddressId: string): void {
    void this.purchaseCoreSrv.controllers.shipment.addressesOnChange(selectedAddressId);
  }

  msgActiveOnChangeHandler(data: { value: boolean; key: MsgKeyType }): void {
    this[data.key].active = data.value;
  }

  msgValueOnChangeHandler(data: { value: string; key: MsgKeyType }): void {
    this[data.key].text = data.value;
    this[data.key].remainingWords = this[data.key].limit - data.value.length;
  }

  payCartHandler(data: { stripeIntent: stripe.paymentIntents.PaymentIntent }): void {
    void this.purchaseCoreSrv.controllers.payment.payCart(data, this.shipperMsg, this.dedicatoryMsg);
  }

  payWithNewCardHandler(params: INewCard): void {
    void this.purchaseCoreSrv.controllers.payment.payWithNewCard(params);
  }

  payWithNewPayPalHandler(): void {
    void this.purchaseCoreSrv.controllers.payment.payWithNewPayPal(this.shipperMsg, this.dedicatoryMsg);
  }

  payWithKlarnaHandler(): void {
    void this.purchaseCoreSrv.controllers.payment.payWithKlarna(this.shipperMsg, this.dedicatoryMsg);
  }

  handleSummaryTitleClick(): void {
    this.purchaseCoreSrv.store.setSummaryOpen(!this.purchaseCoreSrv.store.summaryOpen);
  }

  changeAddressFromSummaryHandler(): void {
    this.shipmentSectionCmp.goToSelectView();
  }

  navToRoute(route: string): void {
    this.routerSrv.navigateToSpecificUrl(route);
  }

  onCrossSellingProductReceived(): void {
    this.loadingProjects = false;
  }

  private _initCheckout(): void {
    const goHash = this._checkGOGuestPayment();

    goHash ? this.purchaseCoreSrv.init.initPurchaseProcess(goHash) : this.purchaseCoreSrv.init.checkProductsAndInit();
  }

  private _checkGOGuestPayment(): string {
    const { section, go } = this.activatedRoute.snapshot.queryParams as { section: CheckoutSectionPathType; go?: string };

    if (section === 'payment' && go) {
      return go;
    }
  }

  private _loadParamsFromFirebase(): void {
    this._loadCrossSellingActiveParamsFromFirebase();
    this._loadApplePayEnabledFromFirebase();
    this._loadKlarnaConfigFromFirebase();
  }

  private _loadCrossSellingActiveParamsFromFirebase(): void {
    this.crossSellingSrv.isCsActive(CROSS_SELLING_LOCATIONS.CART).subscribe(() => {
      this.isCsActive = true;
    });
  }

  private _loadApplePayEnabledFromFirebase(): void {
    this.$isApplePayEnabled = this.stateSrv.isApplePayEnabled();
  }

  private _loadKlarnaConfigFromFirebase(): void {
    this.$klarnaConfig = this.stateSrv.getKlarnaConfig();
    this.$displayKlarnaAdvertising = this.$klarnaConfig.pipe(map(({ advertising }) => advertising || false));
  }

  private _setIsBrowserSafari(): void {
    const browser = this.utilsSrv.getBrowser();

    this.isBrowserSafari = browser === 'safari';
  }

  private _setAllowedPaymentMethods(): void {
    this.$allowedPaymentMethods = this.getStoreDataObservable('allowedPaymentMethods').pipe(
      mergeMap((allowedPaymentMethods: IAllowedPaymentMethods) =>
        this.$isApplePayEnabled.pipe(
          map((isApplePayEnabled) => {
            if (isApplePayEnabled && this.isBrowserSafari) {
              allowedPaymentMethods.applePay = true;
            }

            return allowedPaymentMethods;
          })
        )
      ),
      mergeMap((allowedPaymentMethods: IAllowedPaymentMethods) =>
        this.$klarnaConfig.pipe(
          map((klarnaConfig) => {
            const { isGroupOrder, isAnyProductSubscriptionActive } = this.purchaseCoreSrv.store;

            if (klarnaConfig?.active && !isGroupOrder && !isAnyProductSubscriptionActive) {
              allowedPaymentMethods.klarna = true;
            }

            return allowedPaymentMethods;
          })
        )
      )
    );
  }

  private _initPageLoadedSubscription(): void {
    this.purchaseCoreSrv.store.isPageLoaded$
      .pipe(
        debounceTime(250),
        first((res) => !!res)
      )
      .subscribe(() => {
        const { currentIso } = this.purchaseCoreSrv.store;

        this.CSBlockCmp && this._initCSBlockCmpCrossSelling(currentIso);
      });
  }

  private _initCoutryIsoSubscription(): void {
    this.purchaseCoreSrv.store.subscriptions.add(
      this.purchaseCoreSrv.store.currentIso$
        .pipe(
          filter((iso) => !!iso && this.purchaseCoreSrv.store.isPageLoaded),
          distinctUntilChanged()
        )
        .subscribe((iso) => {
          void this._onCountryIsoChange(iso);
        })
    );
  }

  private async _onCountryIsoChange(iso: string): Promise<void> {
    await this.purchaseCoreSrv.helpers.checkAndSetCredits();
    this.CSBlockCmp && this._initCSBlockCmpCrossSelling(iso);
  }

  private _initCSBlockCmpCrossSelling(iso: string): void {
    this.loadingProjects = true;
    void this.CSBlockCmp.initCrossSelling({ ...this.csParams, country: iso });
  }

  private _initSeals(): void {
    this.sealsSrv.getAll().subscribe((res) => {
      this.seals = res.list;
    });
  }
}
