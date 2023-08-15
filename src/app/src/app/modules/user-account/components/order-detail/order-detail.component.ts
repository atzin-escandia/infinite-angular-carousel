import { Component, OnInit, Injector, Input, EventEmitter, Output, OnChanges } from '@angular/core';
import { OrdersService, CalendarService, EventService, CountryService, ProductService, RouterService, LoaderService } from '@app/services';
import { BaseComponent } from '@app/components';
import { PopoverService } from '@services/popover';
import { GenericPopupComponent } from '@popups/generic-popup';
import { PlanShipmentPopupComponent } from '../../popups/plan-shipment';

import dayjs from 'dayjs';
import {
  ORDER_PAYMENT_STATUS,
  ORDER_STATUS,
  ORDER_TICKET_STATUS,
  ORDER_TYPE,
  ORDER_DELIVERY_STATUS,
  PURCHASE_ROLE,
} from '@constants/order.constants';
import { CrowdgivingNgoService } from '@modules/crowdgiving/services';
import { mapOrderStatusDetailColor, mapOrderStatusDetailMsg, OrderStatusDetailColorType } from '../../utils/maps/order.map';
import { AccordionGift, IOrderStatusParams, RolePermission } from '../../interfaces/order.interface';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbItem } from '@app/components/breadcumbs/breadcrumbs.component';
import { TranslocoService } from '@ngneat/transloco';
import { PAYMENT_METHOD } from '@app/modules/purchase/constants/payment-method.constants';
import { getUserAreaBoxName } from '@app/pages/subscription-box/services/subscription-box.helper';

@Component({
  selector: 'order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
})
export class OrderDetailComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() public order: any;
  @Input() public status: ORDER_STATUS;
  @Input() public UpOrder: boolean;
  @Input() public app: string;
  @Output() checkLoginEvn = new EventEmitter<any>();
  @Output() refreshOrderInfo = new EventEmitter<any>();

  get orderStatusParams(): IOrderStatusParams {
    const { orderDeliveryStatus, orderPaymentStatus, orderTicketStatus, orderType } = this.order;

    return { orderDeliveryStatus, orderPaymentStatus, orderTicketStatus, orderType };
  }

  get orderStatusDetailColor(): OrderStatusDetailColorType {
    const { orderDeliveryStatus, orderTicketStatus, orderPaymentStatus } = this.order;

    return mapOrderStatusDetailColor({ orderDeliveryStatus, orderTicketStatus, orderPaymentStatus });
  }

  get orderStatusDetailMsg(): { id: string; replacements?: any } | null {
    const { orderPaymentStatus, orderDeliveryStatus, orderTicketStatus, orderType } = this.order;

    return mapOrderStatusDetailMsg({ orderDeliveryStatus, orderTicketStatus, orderPaymentStatus, orderType }, this.order);
  }

  get isFreeDelivery(): boolean {
    return this.order.orderType === ORDER_TYPE.FREE_BOX || this.order.orderType === ORDER_TYPE.NEW_SHIPMENT_FARMER;
  }

  get isOrderPaymentPending(): boolean {
    return this.order.orderPaymentStatus === ORDER_PAYMENT_STATUS.ORDER_PENDING;
  }

  // Check ticket status toknow if plan all harvest is available
  get ticketOpened(): boolean {
    return this.order.orderTicketStatus && this.order.orderTicketStatus === ORDER_TICKET_STATUS.ORDER_TICKET_OPENED;
  }

  availableDates: any = [];

  orderId: string;
  countriesByIso: any;
  trackingToShow = false;
  cancellable: any;
  loadingUpOrders = true;

  products: any;
  address: any;
  payment: any;
  name: string;
  ngoName: string;

  changeAddressAvailable = false;
  changeDeliveryAvailable = false;
  cancelOrder = false;
  pictureURL: string;

  availableShipment = false;
  openIssue = false;

  showAllTrackings = false;
  showAllProducts = false;
  limitTracking: number = this.domSrv.getIsDeviceSize() ? 2 : 4;
  limitProducts = 4;
  showDeliveryBlock = false;
  dayAfterEstimatedDelivery = false;
  orderRefunded = false;
  ordersNS = [];
  showTooltip = false;
  NSGeneratedOrders = [];
  textNotification: string;
  groupOrder: string;
  subscription: string;
  breadcrumbs: BreadcrumbItem[] = [];

  isVisa = false;
  isMastercard = false;
  isSepa = false;
  isKlarna = false;
  dataAccordion: AccordionGift;
  isGifter = false;
  isPromoter = false;
  isGuest = false;
  rolePermissions: RolePermission;
  deliveryDate: string;

  constructor(
    public injector: Injector,
    public ordersSrv: OrdersService,
    public popoverSrv: PopoverService,
    private calendarSrv: CalendarService,
    public countrySrv: CountryService,
    public route: ActivatedRoute,
    public eventSrv: EventService,
    private productSrv: ProductService,
    public loaderSrv: LoaderService,
    public routerSrv: RouterService,
    private translocoSrv: TranslocoService,
    private ngoService: CrowdgivingNgoService
  ) {
    super(injector);
  }

  async ngOnChanges(): Promise<void> {
    this.getAdoptionActiveMB();
    this.address = this.order.shipment?.address;
    this.productSrv.productType(this.order);

    if (this.order.orderPaymentStatus === ORDER_PAYMENT_STATUS.ORDER_CANCELLED) {
      this.cancellable = await this.ordersSrv.canBeCancelled(this.order._id);
    }

    this.ordersSrv.assingOrderStatus(this.order, false);
    this.cancellable = await this.ordersSrv.canBeCancelled(this.order._id);
    this.cancelOrder = this.canCancelOrder(this.order);

    // Show trackings
    if (this.order.lapiInfo) {
      this.trackingToShow = this.order.lapiInfo.boxes.length > 0;
    }

    this.setPaymentStatus();

    this.loadingUpOrders = false;

    if (!this.order.multiShot && !this.order.multiShotRenew && this.order.shipment) {
      const boxSent = this.order.shipment.boxes[0]; // In the shipment, all the boxes are the same

      this.products = boxSent.products;
    }

    this.setImageAndName();

    this.openIssue = this.order.canOpenIssue;

    if (this.order.upCf && !this.order.upCf.deleted) {
      this.availableShipment = this.order.upCf.stepMSReserved > this.order.upCf.stepMSUsed;
    }

    this.orderRefunded = this.order.orderPaymentStatus === ORDER_PAYMENT_STATUS.ORDER_REFUNDED;
    this.order.shipment && this.deliveryInfoBlock();

    for (const notification of this.order.notifications) {
      if (notification.type === 'NEW_SHIPMENT_ORDER_CREATED') {
        this.ordersNS.push(notification.description);
      }
    }

    this.NSGeneratedOrders = [];
    this.showTooltip = false;

    for (const notification of this.order.notifications) {
      if (
        notification &&
        notification?.type === 'NEW_SHIPMENT_ORDER_CREATED' &&
        notification?.payload?.newShipmentId &&
        this.order.orderTicketStatus === ORDER_TICKET_STATUS.ORDER_TICKET_CLOSED
      ) {
        this.NSGeneratedOrders.push({ orderNumber: notification.description, id: notification.payload.newShipmentId });
      }
    }

    const isGuestTicketOpen =
      this.rolePermissions.nameOfRole === PURCHASE_ROLE.GUEST && this.order.orderTicketStatus === ORDER_TICKET_STATUS.ORDER_TICKET_OPENED;

    this.textNotification =
      !isGuestTicketOpen && this.orderStatusDetailMsg
        ? this.translocoSrv.translate(this.orderStatusDetailMsg.id)
        : this.translocoSrv.translate('notifications.guest.parent-order.text-info');
  }

  async ngOnInit(): Promise<void> {
    this.rolePermissions = this.ordersSrv.checkUserProfile(this.order);

    if (this.rolePermissions.showPaymentInfo) {
      this.isSepa = this.order.paymentMethods.crowdfarmer.sepa;
      this.isVisa = this.order.paymentMethods.crowdfarmer.card?.brand === 'visa';
      this.isMastercard = this.order.paymentMethods.crowdfarmer.card?.brand === 'mastercard';
      this.payment = this.order.paymentMethods.crowdfarmer;
      this.isSepa = this.payment.sepa;
      this.isVisa = this.payment.card?.brand === 'visa';
      this.isMastercard = this.payment.card?.brand === 'mastercard';
      this.isKlarna = this.payment.paymentRequest?.id?.payment_method_types?.includes(PAYMENT_METHOD.KLARNA);
    }

    this.countriesByIso = await this.countrySrv.getCountriesByISO();

    this.langSrv.getCurrent().subscribe(() => {
      this.name = this.order._m_name[this.langSrv.getCurrentLang()] || this.order._m_name.en;
    });

    this.deliveryDate = this.order.shipment.arrivalEstimateDate;
    this.order?.gift && this.setGiftAccordion();

    this.subscription = this.order._subscription;
    this.changeAddressAvailable = this.canChangeAddress(this.order);
    this.changeDeliveryAvailable = await this.canChangeDelivery();
    this.setBreadcrumbs();
    await this.setNgoInfo();
  }

  async setNgoInfo(): Promise<void> {
    if (this.order._ngo) {
      try {
        this.ngoName = (await this.ngoService.getNgoBasicInfo(this.order._ngo)).name;
      } catch (e) {
        this.loggerSrv.error('Error loading ngo');
      }
    }
  }

  getAdoptionActiveMB(): void {
    if (this.order.up?.masterBoxes) {
      this.order.up.masterBoxes = this.order.up.masterBoxes.filter((mb: any) => mb.adoptionActive);
    }
  }

  /**
   * Pass autoLogin validation
   */
  autoLoginValidation(funcName: string): void {
    this.checkLoginEvn.emit({ funcName, order: this.order, availableDates: this.availableDates });
  }

  getReceiptText(type: string): string {
    const receipText = {
      RECEIPT: this.textSrv.getText('Receipt'),
      CREDIT_NOTE: this.textSrv.getText('credit note'),
    };

    return receipText[type] || '';
  }

  /**
   * Open receipt url in browser
   */
  getReceipt(receiptURL: string): void {
    // TODO: Universal fix needed
    if (this.domSrv.isPlatformBrowser()) {
      this.app ? window.open(receiptURL, '_self') : window.open(receiptURL);
    }
  }

  canChangeAddress(order: any): boolean {
    const { multiShot = null, multiShotRenew = null, notifications, orderDeliveryStatus, orderPaymentStatus, orderTicketStatus } = order;
    const isGroupOrderPending = orderPaymentStatus === ORDER_PAYMENT_STATUS.ORDER_PENDING && this.order._purchaseInfo;
    const isOrderPaid = orderPaymentStatus === ORDER_PAYMENT_STATUS.ORDER_PAID;
    const isOrderCollected = orderPaymentStatus === ORDER_PAYMENT_STATUS.ORDER_COLLECTED;

    return (
      orderDeliveryStatus === ORDER_DELIVERY_STATUS.ORDER_PENDING &&
      (isOrderPaid || isOrderCollected || isGroupOrderPending) &&
      orderTicketStatus === ORDER_TICKET_STATUS.NONE &&
      !multiShot &&
      !multiShotRenew &&
      notifications &&
      !this.isGuest &&
      !this.isLabelPrinted(order.notifications) &&
      this.rolePermissions.changeAddress
    );
  }

  isLabelPrinted(notifications: any[]): boolean {
    const printed = 'LAPI_LABEL_PRINTED';
    const reprint = 'LAPI_SET_LABEL_TO_REPRINT';

    const labelPrinted = notifications.find((item) => item.type === printed);
    const labelReprint = notifications.find((item) => item.type === reprint);

    if (!labelPrinted) {
      return false;
    }

    if (!labelReprint) {
      return true;
    }

    if (labelPrinted && labelReprint) {
      return new Date(labelPrinted.date) > new Date(labelReprint.date);
    }
  }

  async canChangeDelivery(): Promise<boolean> {
    // Get available dates for calendar
    if (
      this.order.shipment &&
      this.order._season === this.order.up._currentShippingSeason &&
      !this.order.multiShot &&
      !this.order.multiShotRenew &&
      ![ORDER_TYPE.FREE_BOX, ORDER_TYPE.NEW_SHIPMENT_FARMER].includes(this.order.orderType) &&
      this.order.status !== ORDER_STATUS.CANCELLED &&
      this.rolePermissions.changeDelivery
    ) {
      this.availableDates = await this.calendarSrv
        .getAvailableDates(this.order.shipment.address.country, {
          masterBox: this.order.shipment.boxes[0]._masterBox,
          type: this.order.orderType === ORDER_TYPE.ONE_SHOT_RENEWAL ? ORDER_TYPE.ONE_SHOT : this.order.orderType,
          ums: this.order.ums,
          up: this.order.up,
          upCf: this.order.orderType === ORDER_TYPE.MULTI_SHOT_SINGLE_BOXES ? this.order._upCf : null,
        })
        .catch(() => {
          this.availableDates = [];
        });
    } else {
      this.availableDates = [];
    }

    return this.changeAddressAvailable && this.availableDates.length > 1;
  }

  canCancelOrder(order: any): boolean {
    return (
      this.cancellable?.canBeCancelled && order.orderTicketStatus !== ORDER_TICKET_STATUS.ORDER_TICKET_OPENED && !this.order.purchaseRole
    );
  }

  setImageAndName(): void {
    if (this.order._dbox) {
      const subscriptionString: string = this.translocoSrv.translate('discoverybox.page.subscription-details-box.title');
      const boxNameString: string = this.translocoSrv.translate(getUserAreaBoxName(this.order.createdAt));

      this.name = `${subscriptionString}: ${boxNameString}`;
    } else {
      this.name = this.order._m_name[this.langSrv.getCurrentLang()] || this.order._m_name.en;
    }
    this.pictureURL = this.order.pictureURL;
  }

  planShipment(ticketOpen: boolean): void {
    if (!ticketOpen) {
      this.popupSrv.open(PlanShipmentPopupComponent, {
        data: {
          up: this.order.up,
          upCf: this.order.upCf,
          isFullHeight: true,
          close: true,
        },
      });
    }
  }

  setPaymentStatus(): void {
    const paid = [ORDER_PAYMENT_STATUS.ORDER_COLLECTED, ORDER_PAYMENT_STATUS.ORDER_PAID, ORDER_PAYMENT_STATUS.TRANSFER_PAYMENT];
    const refunded = [ORDER_PAYMENT_STATUS.ORDER_REFUNDED, ORDER_PAYMENT_STATUS.ORDER_PARTIALLY_REFUNDED];
    const pending = [ORDER_PAYMENT_STATUS.ORDER_PENDING];
    const cancel = [ORDER_PAYMENT_STATUS.ORDER_CANCELLED];
    const rejected = [ORDER_PAYMENT_STATUS.ORDER_REJECTED, ORDER_PAYMENT_STATUS.ORDER_DECLINED];

    if (pending.indexOf(this.order.orderPaymentStatus) !== -1 || paid.indexOf(this.order.orderPaymentStatus) !== -1) {
      this.order.paymentStatusText = 'paid';
    } else if (refunded.indexOf(this.order.orderPaymentStatus) !== -1) {
      this.order.paymentStatusText = 'refund';
    } else if (cancel.indexOf(this.order.orderPaymentStatus) !== -1) {
      this.order.paymentStatusText = 'cancelled';
    } else if (rejected.indexOf(this.order.orderPaymentStatus) !== -1) {
      this.order.paymentStatusText = 'rejected';
    }
  }

  setBreadcrumbs(): void {
    this.breadcrumbs = [
      {
        isSelected: false,
        label: 'page.Your-orders.title',
        onClick: () => this.routerSrv.navigateToOrderList(),
      },
      {
        isSelected: true,
        label: 'global.Order-details.text-info',
        extraInfo: this.order.orderNumber,
      },
    ];

    if (this.subscription) {
      const subscriptionUrl = {
        isSelected: false,
        label: this.order.subscriptionNumber || 'global.recurrent-order.title',
        onClick: () => this.routerSrv.navigate(`private-zone/my-order/subscription-info/${this.subscription}`),
      };

      this.breadcrumbs.splice(1, 0, subscriptionUrl);
    }
  }

  deliveryInfoBlock(): void {
    const arrivalDate = dayjs(this.order.shipment.arrivalEstimateDate, {});
    const hasTrackingInfo = this.order.lapiInfo?.boxes[0] && !!this.order.lapiInfo.boxes[0].tracking;
    const hasBoxesInShipment = !!this.order.shipment?.boxes?.[0]?._boxId;

    if (arrivalDate && hasTrackingInfo && hasBoxesInShipment) {
      const isTodayGreaterOrEqualThanArrivalDate = dayjs(arrivalDate, '').diff(dayjs()) <= 0;
      const isTodayGreaterThanArrivalDate = dayjs(arrivalDate, '').diff(dayjs(), 'day') <= -1;

      if (
        isTodayGreaterOrEqualThanArrivalDate &&
        this.order.orderDeliveryStatus !== ORDER_DELIVERY_STATUS.ORDER_DELIVERED &&
        this.order.orderPaymentStatus !== ORDER_PAYMENT_STATUS.ORDER_REFUNDED &&
        this.order.orderTicketStatus !== ORDER_TICKET_STATUS.ORDER_TICKET_CLOSED
      ) {
        this.showDeliveryBlock = true;
      }

      if (isTodayGreaterThanArrivalDate) {
        this.dayAfterEstimatedDelivery = true;
      }
    }
  }

  async gotBox(deliveryIssue = false): Promise<void> {
    const deliveryFeedbackInfo = {
      orderId: this.order._id,
      lapiInfo: this.order.lapiInfo,
      orderNumber: this.order.orderNumber,
      _boxId: this.order.shipment.boxes[0]._boxId,
      deliveryIssue,
    };

    await this.ordersSrv.deliveryFeedback(deliveryFeedbackInfo);

    const popup = this.popupSrv.open(GenericPopupComponent, {
      data: {
        header: this.translocoSrv.translate(deliveryIssue ? 'page.order-not-arrived.title' : 'page.hope-you-enjoy.body'),
        msg: this.translocoSrv.translate(
          deliveryIssue ? 'page.already-working-solution.body' : 'global.inform-products-bad-conditions.body'
        ),
        style: 2,
        close: true,
      },
    });

    popup.onClose.subscribe(() => {
      this.refreshOrderInfo.emit();

      if (!deliveryIssue) {
        this.showDeliveryBlock = false;
      }
    });
  }

  openNSTooltip(e: MouseEvent): void {
    e.stopPropagation();
    this.showTooltip = !this.showTooltip;
  }

  closeTooltip(): void {
    this.showTooltip = false;
  }

  navigateToParentOrder(): void {
    this.routerSrv.navigate(`private-zone/my-order/info/${this.order.relatedOrder._id as string}?app=${this.app}`);
  }

  navigateToChildOrder(orderId: string): void {
    this.routerSrv.navigate(`private-zone/my-order/info/${orderId}?app=${this.app}`);
  }

  private setGiftAccordion(): void {
    const isGifter = this.rolePermissions.nameOfRole === PURCHASE_ROLE.GIFTER;

    if (isGifter) {
      this.deliveryDate = this.order.shipment.originalArrivalDate;
    }

    const name = isGifter ? this.order.gift.giftOptions.name : this.order.gift.buyer?.name;
    const email = isGifter ? this.order.gift.giftOptions.email : this.order.gift.buyer?.email;
    const { date, message } = this.order.gift.giftOptions;

    this.dataAccordion = {
      header: {
        gift: {
          isGifter,
        },
      },
      body: [
        {
          title: isGifter ? 'global.recipient.text-info' : 'global.gifter.text-info',
          content: {
            info: name,
            extraInfo: email,
            italic: false,
          },
        },
        {
          title: 'page.personalized-email-message.form',
          content: {
            info: message,
            italic: true,
          },
        },
        ...(isGifter
          ? [
              {
                title: 'global.date-email-sent.text-info',
                content: {
                  info: this.utilsSrv.dateForFront(date),
                  italic: false,
                },
              },
            ]
          : []),
      ],
    };
  }
}
