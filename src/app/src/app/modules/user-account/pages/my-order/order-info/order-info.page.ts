import { Component, OnInit, Injector } from '@angular/core';

import { BasePage } from '@app/pages';
import { ORDER_STATUS } from '@app/constants/order.constants';
import { PRODUCT_TYPE } from '@app/constants/product.constants';
import { UnknownObjectType, IEcommerceTracking } from '@app/interfaces';
import { mapOrderStatus } from '@app/modules/user-account/utils/maps/order.map';
import { ConfirmationPopupComponent } from '@app/popups/confirmation-popup';
import { GenericPopupComponent } from '@app/popups/generic-popup';
import { OrderAddressPopupComponent } from '@app/popups/order-address-popup';
import { StatusPopupComponent } from '@app/popups/status-popup';
import { OrdersService, CountryService, EventService, CartsService, TrackingConstants, TrackingService } from '@app/services';
import { PopoverService } from '@app/services/popover';

@Component({
  selector: 'order-info',
  templateUrl: './order-info.page.html',
  styleUrls: ['./order-info.page.scss'],
})
export class OrderInfoPageComponent extends BasePage implements OnInit {
  public orderId: string;
  public order: any;
  public countriesByIso: any;
  public changeAddressPopup: any;
  public orderStatus: string;
  public availableDates: any;

  public productType = PRODUCT_TYPE;

  get parsedOrderStatus(): ORDER_STATUS {
    const { orderDeliveryStatus, orderPaymentStatus, orderTicketStatus, orderType } = this.order;

    return mapOrderStatus({ orderDeliveryStatus, orderPaymentStatus, orderTicketStatus, orderType });
  }

  constructor(
    public injector: Injector,
    private orderSrv: OrdersService,
    public popoverSrv: PopoverService,
    public countrySrv: CountryService,
    public eventSrv: EventService,
    public cartsSrv: CartsService,
    private trackingSrv: TrackingService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    // Identifies order from params
    this.route.params.subscribe(async (params) => {
      this.setInnerLoader(true, true);
      this.orderId = params.orderId;
      // Load order info
      this.order = await this.orderSrv.get(this.orderId, true);
      // Load countries
      this.countriesByIso = await this.countrySrv.getCountriesByISO();
      // Let private zone menu know that this component is open
      this.eventSrv.dispatchEvent('private-zone-url', { router: this.routerSrv.getPath() });
      this.setLoading(false);
      this.setInnerLoader(false, false);
    });
  }

  /**
   * Chaneg order address
   */
  public changeAddressInfo(): void {
    this.changeAddressPopup = this.popupSrv.open(OrderAddressPopupComponent, {
      data: {
        order: this.order,
        user: this.user,
        countriesByIso: this.countriesByIso,
      },
    });

    this.changeAddressPopup.onClose.subscribe(async (result) => {
      if (result) {
        this.order = null;
        this.popupSrv.open(GenericPopupComponent, { data: { msg: this.textSrv.getText(result), id: 'change-address' } });
        this.order = await this.orderSrv.get(this.orderId, true);
        this.domSrv.scrollToTop();
      }
    });
  }

  /**
   * Chande order dates
   */
  public changeDeliveryDate(): void {
    // Open calendar
    this.popoverSrv.open(
      'CalendarShipmentComponent',
      this.domSrv.getIsDeviceSize() ? 'order-overview-change-mob' : 'order-overview-change',
      {
        inputs: {
          order: this.order,
          availableDates: this.availableDates,
          customClass: 'order-detail-calendar',
          customBackground: 'opacity: 0.24; background-color: #1a1a1a; z-index: 600;',
          scroll: false,
          showX: true,
        },
        outputs: {
          save: async (date: any) => {
            try {
              // Change to new date
              await this.orderSrv.changeDate(this.order._id, date);
              // Refresh order info
              this.order = await this.orderSrv.get(this.orderId, true);

              this.popupSrv.open(StatusPopupComponent, { data: { msgSuccess: 'Order delivery date change success' } });
            } catch (e) {
              this.popupSrv.open(StatusPopupComponent, { data: { err: true, msgError: e.msg } });
            }
          },
          onClose: () => {
            this.popoverSrv.close('CalendarShipmentComponent');
          },
        },
      }
    );
  }

  /**
   * Cancel order
   */
  public async cancelOrder(): Promise<void> {
    const userActive = await this.userService.get();
    const isRecipientOrder = this.order.gift && this.order.gift._buyer !== userActive._id;
    let popup = this.popupSrv.open(ConfirmationPopupComponent, {
      data: {
        title: isRecipientOrder ? 'global.cancel-gift.text-link' : 'page.cancel-order.button',
        msg: isRecipientOrder ? 'page.cancel-gift-confirmation.text-info' : 'page.cancel-order.text-info',
        advise: isRecipientOrder ? 'page.refund-recipient.text-info' : 'page.refund-info.body',
        okAction: isRecipientOrder ? 'global.cancel-gift.text-link' : 'global.cancel-order.text-link',
        cancelAction: 'page.return.button',
      },
    });

    popup.onClose.subscribe(async (result) => {
      if (result) {
        try {
          this.setInnerLoader(true, true);

          await this.orderSrv.cancelOrder(this.order._id);

          if (this.order.orderType !== 'ECOMMERCE') {
            const masterBoxes = this.order.up.masterBoxes.map(({ _id }) => _id);

            this.cartsSrv.removeItemByMasterbox(masterBoxes);
          }

          this.routerSrv.navigateToOrderList();

          this.trackGA4CancelOrder(this.order);

          popup = this.popupSrv.open(StatusPopupComponent, { data: { msgSuccess: 'cancel success' } });
        } catch (err) {
          this.setInnerLoader(false, true);

          this.popupSrv.open(StatusPopupComponent, {
            data: {
              err: true,
              msgError: this.textSrv.getText('Operation not available'),
            },
          });
        } finally {
          this.setInnerLoader(false, true);
        }
      }
    });
  }

  /**
   * Open incident process
   */
  public openIncident(): void {
    if (this.domSrv.isPlatformBrowser()) {
      const url = `${this.env.mainDomain}/${this.langSrv.getCurrentLang()}/private-zone/open-issue/${this.getParam('orderId')}`;

      window.open(url, this.app ? '_self' : 'blank');
    }
  }

  /**
   * Pass autoLogin validation
   */
  public autoLoginValidation(e: any): void {
    if (e.availableDates) {
      this.availableDates = e.availableDates;
    }
    void this.checkLogin(() => this[e.funcName](e.id));
  }

  public async refreshOrderInfo(): Promise<void> {
    this.order = await this.orderSrv.get(this.orderId, true);
  }

  // TODO: fill in with IEcommerceTracking
  private trackGA4CancelOrder(order: UnknownObjectType): void {
    const items: IEcommerceTracking[] = [];
    const listName = this.trackingSrv.getInterimGA4List();
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
