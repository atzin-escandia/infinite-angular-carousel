import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { IMPACT_MESSAGES_PAGE } from '@app/modules/purchase/constants/impact-messages.constants';
import { IAddress, ICountry, IEcommerceTracking, IGroupOrderConfirm, IStorageLastPayment, UnknownObjectType } from '@app/interfaces';
import { IBlogPost } from '@app/interfaces/blog-post.interface';
import { BlogResource } from '@app/resources';
import {
  CountryService,
  LangService,
  LoggerService,
  RouterService,
  StateService,
  StorageService,
  TextService,
  TrackingConstants,
  TrackingService,
} from '@app/services';
import { PopupService } from '@services/popup';
import { GOInvitationPopupComponent } from '@app/modules/purchase/popups/go-invitation-popup/go-invitation-popup.component';
import { ImpactMessagesService } from '@app/services/impact-messages/impact-messages.service';
import { PurchaseCoreService } from '@app/modules/purchase/services/purchase.service';
import { ImpactMessages } from '@app/modules/purchase/interfaces/impact-messages.interface';
import { PRODUCT_TYPE } from '@app/constants/product.constants';
import {ParseArticlesService} from '@app/modules/e-commerce/services/parse-articles/parse-articles.service';

@Component({
  selector: 'app-order-ok',
  templateUrl: './order-ok.page.html',
  styleUrls: ['./order-ok.page.scss'],
})
export class OrderOkPageComponent implements OnInit, OnDestroy {
  isLoading = true;
  orders: any[] = [];
  payment: any;
  address: IAddress;
  products: UnknownObjectType[] = [];
  cart: UnknownObjectType[] = [];
  farmersShowing: any = [];
  summaryOpen = false;
  totalPrice = 0;
  countriesByIso: { [key: string]: ICountry };
  blogPosts: IBlogPost[] = [];
  groupOrderData?: IGroupOrderConfirm;
  groupOrderLink?: string;
  isGroupOrderPromoter = false;
  isProductSubscriptionAvailable: boolean;
  isProductGiftAvailable: boolean;
  impactMessage: ImpactMessages;
  showFarmersThanksPlaceholder = false;
  lastPayment: IStorageLastPayment;

  constructor(
    private activatedRoute: ActivatedRoute,
    private purchaseCoreSrv: PurchaseCoreService,
    public textSrv: TextService,
    private storageSrv: StorageService,
    private langSrv: LangService,
    private trackingSrv: TrackingService,
    private routerSrv: RouterService,
    private popupSrv: PopupService,
    private countrySrv: CountryService,
    private stateSrv: StateService,
    private blogRsc: BlogResource,
    private loggerSrv: LoggerService,
    public impactMessagesSrv: ImpactMessagesService,
    private parseEcArticlesSrv: ParseArticlesService
  ) {}

  ngOnInit(): void {
    void this._initPage();
    this.parseEcArticlesSrv.clearBoxShoppingList();
  }

  ngOnDestroy(): void {
    let i = 0;
    let e2ePurchaseIdExists;

    do {
      this.storageSrv.clear(`e2ePurchaseId${i}`, 2);
      i++;
      e2ePurchaseIdExists = !!this.storageSrv.get(`e2ePurchaseId${i}`, 2);
    } while (e2ePurchaseIdExists);
  }

  handleSummaryTitleClick(): void {
    this.summaryOpen = !this.summaryOpen;
  }

  navToFarmersPage(): void {
    this.routerSrv.navigateToFarmersMarket('ADOPTION');
  }

  navToPrivateZonePage(): void {
    this.routerSrv.navigate('private-zone');
  }

  openGOInvitationPopup(): void {
    this.popupSrv.open(GOInvitationPopupComponent, {
      data: {
        invitationUrlLink: this.groupOrderLink,
        purchaseInfoId: this.groupOrderData.purchaseId,
        invitationsLimit: this.groupOrderData.cart.guestsLimit * 3,
        emailsList: [],
      },
    });
  }

  private async _initPage(): Promise<void> {
    try {
      this.purchaseCoreSrv.common.setLoading(true);
      this.purchaseCoreSrv.common.setInnerLoader(true, true);
      this.lastPayment = this.storageSrv.get('lastPayment');

      const goHash = this._checkParams();
      const lang = this.langSrv.getCurrentLang();

      await this._setIsProductSubscriptionAvailable();
      await this._setIsProductGiftAvailable();

      if (goHash) {
        await this._handleGroupOrder(goHash, lang);
      } else {
        this._loadData();
      }

      await this._setCountriesByIso();
      await this._loadBlogPost(lang);

      this.isGroupOrderPromoter && this.openGOInvitationPopup();

      try {
        this.trackingSrv.tradeDoublerConfirmation(this.products, this.lastPayment);
      } catch (error) {
        this.loggerSrv.log('Error on sending info to Trade Doubler', { logType: 'tracking', error: JSON.stringify(error) });
      }
      void this.getImpactMessage();
    } catch (err) {
      this.purchaseCoreSrv.common.logError(err);
    } finally {
      this.isLoading = false;
      this.purchaseCoreSrv.common.setLoading(false);
      this.purchaseCoreSrv.common.setInnerLoader(false, false);

      // If impact message, remove it
      this.storageSrv.clear('impactMessage');
    }
  }

  private _checkParams(): string | undefined {
    const { hash } = this.activatedRoute.snapshot.params;

    return hash;
  }

  private async _setIsProductSubscriptionAvailable(): Promise<void> {
    try {
      this.isProductSubscriptionAvailable = await this.stateSrv
        .isSubscriptionAvailable()
        .pipe(first((res) => typeof res === 'boolean'))
        .toPromise();
    } catch (err) {
      this.isProductSubscriptionAvailable = false;
    }
  }

  private async _setIsProductGiftAvailable(): Promise<void> {
    try {
      this.isProductGiftAvailable = await this.stateSrv
        .isProductGiftAvailable()
        .pipe(first((res) => typeof res === 'boolean'))
        .toPromise();
    } catch (err) {
      this.isProductGiftAvailable = false;
    }
  }

  private async _handleGroupOrder(goHash: string, lang: string): Promise<void> {
    const { purchaseId, crowdfarmerId, cart } = this.storageSrv.get('groupOrder');

    this.groupOrderData = { purchaseId, crowdfarmerId, cart };
    this.products = await this.purchaseCoreSrv.groupOrder.getProducts(cart.items, cart.country);
    await this._checkIfIsGroupOrderPromoter();
    this.groupOrderLink = `${window?.location?.origin || 'https://crowdfarming.com'}/${lang}/order/go-invitation/${goHash}`;
    this.totalPrice = cart.total.amount;
    this._setFarmers();
  }

  private async _checkIfIsGroupOrderPromoter(): Promise<void> {
    const user = await this.purchaseCoreSrv.common.getUser();

    this.isGroupOrderPromoter = this.groupOrderData.crowdfarmerId === user._id;
  }

  private _loadData(): void {
    const { paymentIntentId, stripeId } = this.lastPayment;

    this._setData(this.lastPayment);
    this._setAnalytics(paymentIntentId || stripeId);
    this._setFarmers();
  }

  private _setData({ products, cart, address, price, purchase, usedCredits }: IStorageLastPayment): void {
    if (purchase) {
      this.orders = purchase.orders;
      this.payment = this._getPayment(purchase.payment);
    }

    this.address = address;
    this.products = products;
    this.cart = cart;
    this.totalPrice = this._getDefaultOrderTotalPrice(price, usedCredits);
  }

  private _getPayment(orderPayment: any): any {
    if (orderPayment.intentInfo) {
      return orderPayment.intentInfo.charges.data[0].payment_method_details.card;
    } else {
      return orderPayment.source;
    }
  }

  private _setAnalytics(id: string): void {
    const analyticsProducts = this._getProductsAnalytics();

    id && analyticsProducts?.length && this._trackPurchaseEvt(id, analyticsProducts);
  }

  private _getProductsAnalytics(): any[] {
    const analyticsProducts = [];

    for (const product of this.products) {
      if (product.type !== PRODUCT_TYPE.ECOMMERCE) {
        const variant =
          product.type === 'OVERHARVEST'
            ? TrackingConstants.GTM.PARAMS.OVERHARVEST
            : product.type === 'ONE_SHOT_RENEWAL' || product.type === 'MULTI_SHOT_RENEWAL'
            ? TrackingConstants.GTM.PARAMS.RENEW
            : product.type === 'MULTI_SHOT_SINGLE_BOXES'
            ? TrackingConstants.GTM.PARAMS.SB
            : TrackingConstants.GTM.PARAMS.ADOPT;

        const price =
          (variant === TrackingConstants.GTM.PARAMS.ADOPT || variant === TrackingConstants.GTM.PARAMS.RENEW
            ? product.price
            : product.price / (product.numBoxes || 1)) || 1;

        analyticsProducts.push({
          name: product.up.code,
          id: product.up._id,
          category: product.up._m_up[this.langSrv.getCurrentLang()],
          quantity:
            (variant === TrackingConstants.GTM.PARAMS.ADOPT || variant === TrackingConstants.GTM.PARAMS.RENEW ? 1 : product.numBoxes) || 1,
          price,
          variant,
        });
      }
    }

    return analyticsProducts;
  }

  private _trackPurchaseEvt(id: string, analyticsProducts: any[]): void {
    this.trackingSrv.trackEvent(TrackingConstants.GTM.EVENTS.PURCHASE, true, {
      purchase: {
        actionField: {
          id, // By default = paymentIntentId | SEPA = stripeId
          revenue: this.totalPrice,
          tax: 0,
          shipping: 0,
        },
        products: analyticsProducts,
      },
    });

    this._trackGA4PurchaseEvt(id);
  }

  private _trackGA4PurchaseEvt(id: string): void {
    const items: IEcommerceTracking[] = [];
    const paymentType = this.getPaymentType();

    this.purchaseCoreSrv.checkoutAnalyticsSrv.trackGA4Analytics(TrackingConstants.GTM4.CHECKOUT_OK_CODE);
    this.purchaseCoreSrv.checkoutAnalyticsSrv.analyticsProductsToGA4(this.products).map((product) => {
      items.push(product);
    });

    const paymentInfoCustomData = {
      cart_id: id,
      payment_type: paymentType,
    };
    const PurchaseCustomData = {
      value: this.totalPrice,
      currency: this.products[0]?.currency?.crowdfarmer?.currency,
      transaction_id: id,
      // tax
      // shipping
      payment_type: paymentType,
      zip_code: this.address?.zip,
    };

    this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.ADD_PAYMENT_INFO, true, { items }, paymentInfoCustomData);
    this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.PURCHASE, true, { items }, PurchaseCustomData);
  }

  private getPaymentType(): string {
    const lastPayment = this.lastPayment?.payment_method_types || this.lastPayment?.purchase?.payment?.intentInfo?.payment_method_types;

    return lastPayment ? lastPayment[0] : '';
  }

  private _setFarmers(): void {
    for (const product of this.products) {
      if (product.type === PRODUCT_TYPE.ECOMMERCE) {
        for (const ecProduct of product.ecommerceProducts) {
          const ecProductFarmerFullName = `${ecProduct.farmer.name as string} ${ecProduct.farmer.surnames as string}`;

          if (!this.farmersShowing.some((farmer) => `${farmer.name as string} ${farmer.surnames as string}` === ecProductFarmerFullName)) {
            this.pushFarmerData(ecProduct.farmer, ecProduct.farm);
          }
        }
      } else {
        if (!this.farmersShowing.some((farmer) => farmer._id === product.farmer._id)) {
          this.pushFarmerData(product.farmer, product.farm);
        }
      }
    }

    if (this.products.some((elem) => elem.type === PRODUCT_TYPE.ECOMMERCE)) {
      const productsLength = this.products
        .filter((elem) => elem.type !== PRODUCT_TYPE.ECOMMERCE).length;
      const ecProductsLength = this.products
        .filter((elem) => elem.type === PRODUCT_TYPE.ECOMMERCE)
        .reduce((acc, currentVal) => acc + currentVal.ecommerceProducts.length, 0);
      const totalProducts = productsLength + ecProductsLength;

      this.showFarmersThanksPlaceholder = totalProducts > 3;
    }
  }

  private pushFarmerData(farmer: UnknownObjectType, farm: UnknownObjectType): void {
    this.farmersShowing.push({
      _id: farmer._id,
      name: farmer.name,
      surnames: farmer.surnames,
      profile: farmer.pictureURL,
      farm: farm._m_name,
    });
  }

  private async _setCountriesByIso(): Promise<void> {
    this.countriesByIso = await this.countrySrv.getCountriesByISO();
  }

  private async _loadBlogPost(lang: string): Promise<void> {
    try {
      this.blogPosts = await this.blogRsc.getPosts(lang);

      if (this.blogPosts && this.blogPosts.length > 0) {
        this.blogPosts.map((m) => {
          if (m.excerpt.rendered && m.excerpt.rendered.indexOf(' [&hellip;]') > -1) {
            m.excerpt.rendered = m.excerpt.rendered.replace(' [&hellip;]', '...');
          }
        });
      } else {
        this.blogPosts = [];
      }
    } catch (err) {
      this.purchaseCoreSrv.common.logError(err);
    }
  }

  private _getDefaultOrderTotalPrice(price: number, usedCredits: number = 0): number {
    const totalPrice = price - usedCredits;

    return totalPrice < 0 ? 0 : totalPrice;
  }

  private getImpactMessage(): void {
    this.impactMessagesSrv
      .isImActive(IMPACT_MESSAGES_PAGE.ORDER_OK)
      .subscribe(() => (this.impactMessage = this.impactMessagesSrv.getImpactMessage(IMPACT_MESSAGES_PAGE.ORDER_OK, this.products)));
  }
}
