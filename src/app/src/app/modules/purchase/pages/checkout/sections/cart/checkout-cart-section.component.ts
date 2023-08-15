import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';
import { CurrencyType } from '@constants/app.constants';
import { TranslocoService } from '@ngneat/transloco';
import { IAllowedPaymentMethods, Seal, UnknownObjectType } from '@app/interfaces';
import { PaymentConfirmationPopupComponent } from '@app/popups/payment-confirmation-popup/payment-confirmation-popup';
import { ConfigService, DomService, LangService, RouterService, TrackingConstants, TrackingService } from '@app/services';
import { GiftService } from '@services/gifts';
import { PopupService } from '@services/popup';
import { GOInfoPopupComponent } from '@app/modules/purchase/popups/go-info-popup/go-info-popup.component';
import { PurchaseCoreService } from '@app/modules/purchase/services/purchase.service';
import { PURCHASE_LS } from '@app/modules/purchase/constants/local-storage.constants';
import { IMPACT_MESSAGES_PAGE } from '@app/modules/purchase/constants/impact-messages.constants';
import { ImpactMessagesService } from '@app/services/impact-messages/impact-messages.service';
import { Device } from '@app/enums/device.enum';
import { IProductUpdateParams } from '@app/modules/purchase/interfaces/product.interface';
import { PRODUCT_TYPE } from '@app/constants/product.constants';

@Component({
  selector: 'checkout-cart-section',
  templateUrl: './checkout-cart-section.component.html',
  styleUrls: ['./checkout-cart-section.component.scss'],
})
export class CheckoutCartSectionComponent implements OnInit {
  @Input() products: UnknownObjectType[] = [];
  @Input() seals: Seal[] = [];
  @Input() hasUnavailableProducts = false;
  @Input() warning18 = false;
  @Input() accepted18 = false;
  @Input() continueDisabled = false;
  @Input() currentIso: string;
  @Input() currentCurrency: CurrencyType;
  @Input() isGroupOrderAvailable = false;
  @Input() credits = 0;
  @Input() creditsToSpend = 0;
  @Input() showCreditsTooltip = false;
  @Input() isUserLogged: boolean;
  @Input() isApplePayEnabled: boolean;
  @Input() displayKlarnaAdvertising: boolean;
  @Input() isBrowserSafari: boolean;
  @Input() isProductSubscriptionAvailable: boolean;
  @Input() isAnyProductSubscriptionActive: boolean;
  @Input() isProductGiftAvailable: boolean;

  @Input() set allowedPaymentMethods(allowedPaymentMethods: IAllowedPaymentMethods) {
    this._allowedPaymentMethods = allowedPaymentMethods;
    const { isUserLogged } = this.purchaseCoreSrv.store;
    const allPaymentMethodsActive: IAllowedPaymentMethods = {
      ...allowedPaymentMethods,
      card: true,
      ideal: true,
      sepa: true,
      paypal: true,
    };

    this.paymentMethodsIconsConfig = isUserLogged ? allowedPaymentMethods : allPaymentMethodsActive;
  }

  get allowedPaymentMethods(): IAllowedPaymentMethods {
    return this._allowedPaymentMethods;
  }

  @Output() warning18Change = new EventEmitter<boolean>();
  @Output() accepted18Change = new EventEmitter<boolean>();
  @Output() productRemove = new EventEmitter<number>();
  @Output() productUpdate = new EventEmitter<IProductUpdateParams & { idx: number }>();
  @Output() nextSection = new EventEmitter();

  get productOver18(): boolean {
    return this.products.some((product) => !!product.up?.masterBoxes?.find((elem: any) => elem.over18));
  }

  get hasValidGOProducts(): boolean {
    if (this.products.find((elem) => elem.type === PRODUCT_TYPE.ECOMMERCE)) {
      return false;
    }

    return this.products.map((elem) => elem.groupPurchase?.available).every((elem) => elem);
  }

  get isGroupOrderValidIso(): boolean {
    const invalidIsos = ['gb', 'us', 'se'];

    return !invalidIsos.includes(this.currentIso);
  }

  get isNextButtonDisabled(): boolean {
    return (
      (this.productOver18 && !this.accepted18) ||
      this.hasUnavailableProducts ||
      this.continueDisabled ||
      this.products.some((elem) => elem.type !== PRODUCT_TYPE.ECOMMERCE && !elem.masterBox?.active) ||
      this.products.some((elem) => elem.type === PRODUCT_TYPE.ECOMMERCE && elem.errors?.restrictions?.length)
    );
  }

  get hasCredits(): boolean {
    return this.creditsToSpend > 0;
  }

  private _allowedPaymentMethods: IAllowedPaymentMethods = {} as any;

  public price$: Observable<number>;
  public finalPrice$: Observable<number>;
  public $canPayWithApplePay: Observable<boolean>;
  public paymentMethodsIconsConfig: IAllowedPaymentMethods = {} as any;
  public isGiftFormCompleted = true;
  public isGiftCompleted: boolean;
  public impactMessage: any;
  public isMobileDevice = false;

  constructor(
    public domSrv: DomService,
    private translocoSrv: TranslocoService,
    private configSrv: ConfigService,
    private purchaseCoreSrv: PurchaseCoreService,
    private trackingSrv: TrackingService,
    private langSrv: LangService,
    private popupSrv: PopupService,
    private routerSrv: RouterService,
    private giftSrv: GiftService,
    private impactMessagesSrv: ImpactMessagesService,
  ) {}

  ngOnInit(): void {
    this._initVars();
    this._setCanPayWithApplePay();
    this._setGroupOrderState(false);
    this.isGiftCompleted = this.giftSrv.getIsGiftDataFilled(this.products);
    void this.getImpactMessage();
    this.isMobileDevice = this.domSrv.getIsDeviceSizeV2(Device.MOBILE);
  }

  private _initVars(): void {
    this.price$ = this.purchaseCoreSrv.store.price$;
    this.finalPrice$ = this.purchaseCoreSrv.store.finalPrice$;
  }

  private _setCanPayWithApplePay(): void {
    this.$canPayWithApplePay = this.finalPrice$.pipe(map((finalPrice) => this.isBrowserSafari && finalPrice > 0));
  }

  public deleteProduct(idx: number): void {
    if (this.products[idx]) {
      if (this.products[idx].type !== PRODUCT_TYPE.ECOMMERCE) {
        this.trackingSrv.trackEvent(TrackingConstants.GTM.EVENTS.REMOVE_FROM_CART, true, {
          remove: {
            products: [this._getTrackProductToRemove(idx)],
          },
        });
      }

      this.productRemove.emit(idx);
      this.purchaseCoreSrv.products.checkProductsSubscription();
    }
  }

  public over18InfoClick(e: MouseEvent): void {
    e.stopPropagation();
    this.popupSrv.open(PaymentConfirmationPopupComponent, {
      data: {
        title: 'page.alcohol-warning.text-info',
        icon: 'eva-alert-triangle-outline',
        isBodyHTML: true,
        body: `
        <ul style="padding-left: 1rem">
          <li>${this.translocoSrv.translate<string>('page.alcohol-abuse.body')}</li>
          <li>${this.translocoSrv.translate<string>('page.alcohol-pregnant.body')}</li>
          <li>${this.translocoSrv.translate<string>('page.alcohol-minors.body')}</li>
          <li>${this.translocoSrv.translate<string>('page.legal-age-alcohol.form')}</li>
        </ul>`,
        confirm: 'global.understood.button',
      },
    });
  }

  public gpInfoClick(): void {
    this.popupSrv.open(GOInfoPopupComponent, { data: {} });
  }

  public accepted18OnChange(val: boolean): void {
    this.accepted18Change.emit(val);
    this.warning18Change.emit(!val);
  }

  public async onNextButtonClick(isGO?: boolean): Promise<void> {
    this.isGiftCompleted = this.giftSrv.getIsGiftDataFilled(this.products);
    const isInvalidOwnerGift = await this.giftSrv.isUserEmailSameAsGift(this.products);

    if (this.hasUnavailableProducts || (isGO && !this.hasValidGOProducts) || !this.isGiftCompleted || isInvalidOwnerGift) {
      this.isGiftFormCompleted = !this.isGiftFormCompleted;

      return;
    }

    if (!this.productOver18 || (this.productOver18 && this.accepted18)) {
      const isNavigationDisabled = this.productOver18 && !this.accepted18;

      this.warning18Change.emit(isNavigationDisabled);
      this._setGroupOrderState(false);

      if (!isNavigationDisabled) {
        try {
          const canInitGO = this.isGroupOrderAvailable && isGO;

          canInitGO ? await this._initGO(isGO) : await this.purchaseCoreSrv.core.setAllowedPaymentMethods();
          this.isUserLogged ? this.nextSection.emit() : this._navToLoginRegisterPage(isGO);
        } catch (err) {
          if (err.cause?.statusCode === 401) {
            this._navToLoginRegisterPage(isGO);
          } else {
            this.purchaseCoreSrv.common.displayStatusPopup(true, err?.displayErrorMessage);
            this.purchaseCoreSrv.common.logError(err);
          }
        } finally {
          this.purchaseCoreSrv.common.setInnerLoader(false, false);
        }
      }
    }
  }

  private async _initGO(isGO: boolean): Promise<void> {
    this.purchaseCoreSrv.common.setInnerLoader(true, true);
    this._setGroupOrderState(isGO && this.hasValidGOProducts);

    if (isGO) {
      await this.purchaseCoreSrv.groupOrder.setCart();
      this.purchaseCoreSrv.groupOrder.handlePaymentMethods();
    }
  }

  private _navToLoginRegisterPage(isGO: boolean): void {
    this.routerSrv.navigate('login-register', null, { rc: true, ...(isGO && { isgo: true }) });
  }

  public continueBuying(): void {
    let route = 'ADOPTION';
    let types = this.products.map((i) => i.type);

    types = [...new Set(types)];

    if (types.every((e) => e === 'OVERHARVEST')) {
      route = 'BOXES';
    }

    this.routerSrv.navigateToFarmersMarket(route);
  }

  public onUpdateProduct({ cartItem, product, subsConfig, isRefresh }: IProductUpdateParams, idx: number): void {
    this.productUpdate.emit({
      cartItem,
      product,
      ...(subsConfig && { subsConfig }),
      idx,
      isRefresh
    });
  }

  private _getTrackProductToRemove(idx: number): any {
    return {
      name: this.products[idx].up.code,
      id: this.products[idx].up._id.toString(),
      category: this.products[idx].up._m_up[this.langSrv.getCurrentLang()],
      price: this.products[idx].price || null,
      quantity: this.products[idx].numMasterBoxes || this.products[idx].ums / this.products[idx].up.masterUnitsStep || 1,
    };
  }

  private _setGroupOrderState(value: boolean): void {
    localStorage.setItem(PURCHASE_LS.IS_GROUP_ORDER, String(value));
    this.purchaseCoreSrv.store.setIsGroupOrder(value);
  }

  public handleApplePayReject(event: boolean): void {
    this.isGiftFormCompleted = event;
  }

  private async getImpactMessage(): Promise<void> {
    await this.impactMessagesSrv.initImpactMessages();

    this.configSrv.isRemoteConfigLoaded$
      .pipe(first((val) => !!val))
      .subscribe(() =>
        this.impactMessagesSrv
          .isImActive(IMPACT_MESSAGES_PAGE.BASKET)
          .subscribe(() => this.impactMessage = this.impactMessagesSrv.getImpactMessage(
            IMPACT_MESSAGES_PAGE.BASKET,
            this.products.filter((elem) => elem.type !== PRODUCT_TYPE.ECOMMERCE)
          ))
      );
  }
}
