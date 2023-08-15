import { Component, OnInit, Injector } from '@angular/core';
import { UnknownObjectType, IEcommerceTracking } from '@app/interfaces';
import { BasePage } from '@app/pages';
import { ConfirmationPopupComponent } from '@app/popups/confirmation-popup';
import { GenericPopupComponent } from '@app/popups/generic-popup';
import { OrderAddressPopupComponent } from '@app/popups/order-address-popup';
import { StatusPopupComponent } from '@app/popups/status-popup';
import { GroupOrderService, CountryService, EventService, TrackingConstants, TrackingService, DEFAULT_LIST_NAME } from '@app/services';
import { PopoverService } from '@app/services/popover';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'order-group-info',
  templateUrl: './order-group-info.page.html',
  styleUrls: ['./order-group-info.page.scss'],
})
export class OrderGroupInfoPageComponent extends BasePage implements OnInit {
  public orderId: string;
  public groupOrder: any;
  public countriesByIso: any;
  public changeAddressPopup: any;
  public orderStatus: string;
  public availableDates: any;
  private canCancel = true;

  constructor(
    public injector: Injector,
    private groupOrderSrv: GroupOrderService,
    public popoverSrv: PopoverService,
    public countrySrv: CountryService,
    public eventSrv: EventService,
    public translocoSrv: TranslocoService,
    private trackingSrv: TrackingService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    // Identifies order from params
    this.route.params.subscribe(async (params) => await this.processParams(params));
  }

  public async processParams(params: any): Promise<void> {
    this.setInnerLoader(true, true);
    this.orderId = params.orderId;
    // Load order info
    try {
      await this.getOrderInfo();
    } catch (error) {
      this.popupSrv.open(GenericPopupComponent, {
        data: {
          msg: error.msg,
        },
      });
    }
    // Load countries
    this.countriesByIso = await this.countrySrv.getCountriesByISO();
    // Let private zone menu know that this component is open
    this.eventSrv.dispatchEvent('private-zone-url', { router: this.routerSrv.getPath() });
    this.setLoading(false);
    this.setInnerLoader(false, false);
  }

  /**
   * Chaneg order addxress
   */
  public changeAddressInfo(ordersPlanned: any[]): void {
    this.changeAddressPopup = this.popupSrv.open(OrderAddressPopupComponent, {
      data: {
        order: ordersPlanned[0],
        user: this.user,
        countriesByIso: this.countriesByIso,
      },
    });

    this.changeAddressPopup.onClose.subscribe(async (result) => {
      if (result) {
        this.popupSrv.open(GenericPopupComponent, {
          data: { msg: this.translocoSrv.translate(result), id: 'change-address' },
        });
        await this.getOrderInfo();
        this.domSrv.scrollToTop();
      }
    });
  }

  // /**
  //  * Cancel order
  //  */
  public cancelOrder(isPromoter: boolean, isAllPlanned: boolean): any {
    let notPromoterMsg;
    let promoterMsg;
    let okActionGuest;
    let isMsgHide = false;

    if (isAllPlanned) {
      notPromoterMsg = this.translocoSrv.translate('notifications.cancel-slot-group-order.body');
      promoterMsg = this.translocoSrv.translate('notifications.cancel-entire-group-order.body');
      okActionGuest = this.translocoSrv.translate('page.cancel-order.button');
    } else {
      promoterMsg = this.translocoSrv.translate('notifications.cancel-partial-group-order.body');
      notPromoterMsg = this.translocoSrv.translate('notifications.guest-cannot-cancel.body');
      okActionGuest = this.translocoSrv.translate('global.understood.button');
      this.canCancel = isPromoter;
      isMsgHide = true;
    }

    let popup = this.popupSrv.open(ConfirmationPopupComponent, {
      data: {
        title: 'page.cancel-order.button',
        msg: isPromoter ? promoterMsg : notPromoterMsg,
        advise: 'page.refund-info.body',
        okAction: isPromoter ? 'global.cancel-order.text-link' : okActionGuest,
        cancelAction: !isAllPlanned && !isPromoter ? null : 'page.return.button',
        showCancelButton: !isAllPlanned && !isPromoter,
        goHideMsg: isMsgHide,
      },
    });

    popup.onClose.subscribe(async (result) => {
      if (result && this.canCancel) {
        try {
          this.setInnerLoader(true, true);
          await this.groupOrderSrv.cancelOrder(this.groupOrder.id);
          this.setInnerLoader(false, true);
          this.routerSrv.navigateToOrderList();

          this.trackGA4CancelOrder(this.groupOrder);

          popup = this.popupSrv.open(StatusPopupComponent, { data: { msgSuccess: 'cancel success' } });
        } catch (err) {
          this.setInnerLoader(false, true);

          this.popupSrv.open(StatusPopupComponent, {
            data: {
              err: true,
              msgError: this.translocoSrv.translate('page.action-not-completed.body'),
            },
          });
        }
      }
    });
  }

  /**
   * Pass autoLogin validation
   */
  public autoLoginValidation(e: any): void {
    e.availableDates && (this.availableDates = e.availableDates);

    if (e.funcName === 'cancelOrder') {
      void this.checkLogin(() => this[e.funcName](e.isPromoter, e.isAllPlanned));
    } else {
      void this.checkLogin(() => this[e.funcName](e.ordersPlanned));
    }
  }

  public async getOrderInfo(): Promise<void> {
    this.groupOrder = await this.groupOrderSrv.getGroupOrderDetail(this.orderId);
  }

  // TODO: fill in with IEcommerceTracking
  private trackGA4CancelOrder(order: UnknownObjectType): void {
    const items: IEcommerceTracking[] = [];
    const listName = this.trackingSrv.getInterimGA4List() || DEFAULT_LIST_NAME;
    const farmName = order?._m_farmName?.en;

    const RefundCustomData = {
      value: order?.amount?.totalToCollect,
      currency: order?.currency?.crowdfarmer?.currency,
      transaction_id: order?.paymentMethods?.crowdfarmer?.paymentRequest?.id?.id,
      payment_type: order?.paymentMethods?.crowdfarmer?.paymentRequest?.id?.payment_method_types[0],
      order_number: order?.orderNumber,
      // customer_type
    };

    items.push({
      index: this.trackingSrv.getPosition(),
      item_brand: farmName,
      currency: order?.currency?.crowdfarmer?.currency,
      price: order?.amount?.totalToCollect,
      item_variant: order?.overharvest ? TrackingConstants.ITEM_VARIANT.OH : TrackingConstants.ITEM_VARIANT.ADOPT,
      quantity: order._m_name?.en?.length ? parseInt(order._m_name.en.charAt(0)) : 1,
      item_id: order?._up,
      item_category: order.up?._m_category?.en,
      item_category2: order.up?._m_subcategory?.en,
      item_category3: order.up?._m_variety?.en,
      item_category4: order.up?._m_subvariety?.en,
      item_list_name: listName,
      item_name: order.up?.code,
      // cart_number_items
      // product_id: e.code, product category id ?
      product_code: order.up?.code,
      // product_project_code: product_id + e.code
      // product_page:
      // product_delivery_plan:
      // product_cost_calculator:
      // product_stock:
      // product_units_left:
      // product_days_left:
      // farmer_country:
      // product_soon:
      // link_type:
      // search_term:
      // product_gift:
    } as IEcommerceTracking);

    this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.REFUND, true, { items }, RefundCustomData);
  }
}
