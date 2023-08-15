import { CommonModule } from '@angular/common';
import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { IAddress, ICountry, IStorageLastPayment, UnknownObjectType } from '@app/interfaces';
import { ParseArticlesService } from '@app/modules/e-commerce/services/parse-articles/parse-articles.service';
import { PurchaseComponentsModule } from '@app/modules/purchase/components/components.module';
import { ImpactMessages } from '@app/modules/purchase/interfaces/impact-messages.interface';
import { PurchaseCoreService } from '@app/modules/purchase/services';
import { PurchaseServicesModule } from '@app/modules/purchase/services/purchase.module';
import { SharedModule } from '@app/modules/shared/shared.module';
import { BasePage } from '@app/pages/base';
import { ImpactMessagesService, TextService, TrackingService } from '@app/services';

@Component({
  selector: 'subscription-box-success-page',
  templateUrl: './success.page.html',
  styleUrls: ['./success.page.scss'],
  imports: [SharedModule, CommonModule, PurchaseServicesModule, PurchaseComponentsModule],
  standalone: true,
})
export class SubscriptionBoxSuccessPageComponent extends BasePage implements OnInit, OnDestroy {
  isLoading = true;
  orders: any[] = [];
  payment: any;
  address: IAddress;
  products: UnknownObjectType[] = [];
  cart: UnknownObjectType[] = [];
  summaryOpen = false;
  totalPrice = 0;
  countriesByIso: { [key: string]: ICountry };
  impactMessage: ImpactMessages;
  lastPayment: IStorageLastPayment;

  constructor(
    public injector: Injector,
    private purchaseCoreSrv: PurchaseCoreService,
    public textSrv: TextService,
    private trackingSrv: TrackingService,
    public impactMessagesSrv: ImpactMessagesService,
    private parseEcArticlesSrv: ParseArticlesService
  ) {
    super(injector);
  }

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

  private async _initPage(): Promise<void> {
    try {
      this.purchaseCoreSrv.common.setLoading(true);
      this.purchaseCoreSrv.common.setInnerLoader(true, true);
      this.lastPayment = this.storageSrv.get('lastPayment');
      this._loadData();
      await this._setCountriesByIso();

      try {
        this.trackingSrv.tradeDoublerConfirmation(this.products, this.lastPayment);
      } catch (error) {
        this.loggerSrv.log('Error on sending info to Trade Doubler', { logType: 'tracking', error: JSON.stringify(error) });
      }
      // void this.getImpactMessage();
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

  private _loadData(): void {
    // const { paymentIntentId, stripeId } = this.lastPayment;

    this._setData(this.lastPayment);
    // this._setAnalytics(paymentIntentId || stripeId);
  }

  private _setData({ cart, address, price, purchase, usedCredits, discoveryBox }: IStorageLastPayment): void {
    if (purchase) {
      this.orders = purchase.orders;
      this.payment = this._getPayment(purchase.payment);
    }

    this.address = address;
    this.products = [discoveryBox];
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

  /*   private _setAnalytics(id: string): void {
    const analyticsProducts = this._getProductsAnalytics();

    id && analyticsProducts?.length && this._trackPurchaseEvt(id, analyticsProducts);
  } */

  /*   private _getProductsAnalytics(): any[] {
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
  } */

  /*   private _trackPurchaseEvt(id: string, analyticsProducts: any[]): void {
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
  } */

  /*   private _trackGA4PurchaseEvt(id: string): void {
    const items: IEcommerceTracking[] = [];
    const listName = this.trackingSrv.getInterimGA4List() || localStorage.getItem(LOCAL_STORAGE_GA4_LIST_NAME) || DEFAULT_LIST_NAME;

    this.trackingSrv.setInterimGA4List(listName);
    this.purchaseCoreSrv.checkoutAnalyticsSrv.trackGA4Analytics(TrackingConstants.GTM4.CHECKOUT_OK_CODE);
    this.purchaseCoreSrv.checkoutAnalyticsSrv.analyticsProductsToGA4(this.products, listName).map((product) => {
      items.push(product);
    });

    const paymentInfoCustomData = {
      cart_id: id,
      payment_type: this.lastPayment?.payment_method_types?.[0],
    };
    const PurchaseCustomData = {
      value: this.totalPrice,
      currency: this.products[0]?.currency?.crowdfarmer?.currency,
      transaction_id: id,
      // tax
      // shipping
      payment_type: this.lastPayment?.payment_method_types[0],
      zip_code: this.address?.zip,
    };

    this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.ADD_PAYMENT_INFO, true, { items }, paymentInfoCustomData);
    this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.PURCHASE, true, { items }, PurchaseCustomData);
  } */

  private async _setCountriesByIso(): Promise<void> {
    this.countriesByIso = await this.countrySrv.getCountriesByISO();
  }

  private _getDefaultOrderTotalPrice(price: number, usedCredits: number = 0): number {
    const totalPrice = price - usedCredits;

    return totalPrice < 0 ? 0 : totalPrice;
  }

  /*   private getImpactMessage(): void {
    this.impactMessagesSrv
      .isImActive(IMPACT_MESSAGES_PAGE.ORDER_OK)
      .subscribe(() => (this.impactMessage = this.impactMessagesSrv.getImpactMessage(IMPACT_MESSAGES_PAGE.ORDER_OK)));
  } */
}
