import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { BaseComponent } from '@app/components';
import { IEcommerceTracking, UnknownObjectType } from '@app/interfaces';
import { OVERHARVEST } from '@app/pages/farmer/overharvest/constants/overharvest.constants';
import { getUserAreaBoxName } from '@app/pages/subscription-box/services/subscription-box.helper';
import {
  CartsService,
  CountryService,
  OrdersService,
  PricesService,
  RouterService,
  TrackingConstants,
  TrackingService,
} from '@app/services';
import { ORDER_PAYMENT_STATUS, ORDER_TYPE, PURCHASE_ROLE } from '@constants/order.constants';
import { TranslocoService } from '@ngneat/transloco';
import { CFCurrencyPipe } from '@pipes/currency';
import { IGift, IOrderStatusParams, RolePermission } from '../../interfaces/order.interface';
import { ColouredPopupComponent } from '../../popups/coloured-popup';

@Component({
  selector: 'order-card',
  templateUrl: './order-card.component.html',
  styleUrls: ['./order-card.component.scss'],
})
export class OrderCardComponent extends BaseComponent implements OnInit {
  @Input() public order: any;
  @Input() public minVersion = false;
  @Input() public app = false;
  @Input() public isFromGroupOrder: boolean;
  @Input() public subscription;
  @Input() public isPromoter: boolean;

  @Output() public detailInUp = new EventEmitter<string>();

  isUpPage: boolean;
  pictureURL: string;
  name: string;
  productNotificationOpen = false;
  boxesAvailable = false;
  price: string;
  gift: IGift;
  isRecipient = false;
  deliveryDate: string;
  rolePermissions: RolePermission;
  orderGiftCancelled = false;
  orderType = ORDER_TYPE;

  orderStatusParams: IOrderStatusParams;
  isFreeDelivery: boolean;
  priceToPay: UnknownObjectType;

  constructor(
    public injector: Injector,
    public ordersSrv: OrdersService,
    public routerSrv: RouterService,
    private cartSrv: CartsService,
    private priceSrv: PricesService,
    private trackingSrv: TrackingService,
    private translocoSrv: TranslocoService,
    private countrySrv: CountryService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    if (this.order.orderType !== ORDER_TYPE.ECOMMERCE) {
      this.setFreeDelivery();
      this.setStatusParams();
      this.rolePermissions = this.ordersSrv.checkUserProfile(this.order);
      this.isUpPage = this.routerSrv.getPath().includes('my-up');
      this.setImageAndName();
      this.boxesAvailable = this.calculateBoxesAvailable();
      this.deliveryDate = this.order.shipment.arrivalEstimateDate;
      this.checkIsGift();
      this.price = this.getPriceLabel();
    }
  }

  public openRejectionPopup(): void {
    // TODO waiting for finance dpt for ultimate message to launch
    this.popupSrv.open(ColouredPopupComponent, {
      data: {
        header: this.textSrv.getText('Rejected payment header'),
        msg: this.textSrv.getText('Rejected payment body'),
        colour: '#ff5555',
      },
    });
  }

  public openOrderDetail(id: string): void {
    if (this.routerSrv.getPath().includes('my-up')) {
      this.detailInUp.emit(id);
    } else {
      this.routerSrv.navigate(`private-zone/my-order/info/${id}`, null, {
        app: this.app,
      });
    }
  }

  public calculateBoxesAvailable(): boolean {
    if ((this.order.multiShot || this.order.multiShotRenew) && this.order.upCf && !this.order.upCf.deleted) {
      if (this.order.upCf.stepMSReserved > this.order.upCf.stepMSUsed) {
        return true;
      }
    }

    return false;
  }

  public setImageAndName(): void {
    if (this.order._dbox) {
      const subscriptionString: string = this.translocoSrv.translate('discoverybox.page.subscription-details-box.title');
      const boxNameString: string = this.translocoSrv.translate(getUserAreaBoxName(this.order.createdAt));

      this.name = `${subscriptionString}: ${boxNameString}`;
    } else {
      this.name = this.order._m_name[this.langSrv.getCurrentLang()] || this.order._m_name.en;
    }
    this.pictureURL = this.order.pictureURL;
  }

  setStatusParams(): void {
    const { orderDeliveryStatus, orderPaymentStatus, orderTicketStatus, orderType } = this.order;

    this.orderStatusParams = { orderDeliveryStatus, orderPaymentStatus, orderTicketStatus, orderType };
  }

  setFreeDelivery(): void {
    this.isFreeDelivery = this.order.orderType === ORDER_TYPE.FREE_BOX || this.order.orderType === ORDER_TYPE.NEW_SHIPMENT_FARMER;
  }

  public async buyAgain(): Promise<void> {
    const boxQuantity: number = this.order.shipment.boxes.length;

    // Place box of order as selected
    this.order.up.masterBox = this.order.up.masterBoxes.find((mb) => mb._id === this.order.shipment.boxes[0]._masterBox);
    this.priceToPay = await this.priceSrv.get(
      this.order.up,
      this.order.shipment.address.country,
      ORDER_TYPE.ORDER_OVERHARVEST,
      boxQuantity
    );

    // Add to tracking
    this.trackingSrv.trackEvent(
      TrackingConstants.GTM.EVENTS.ADD_TO_CART,
      true,
      {
        add: {
          products: [
            {
              name: this.order.up.code,
              id: this.order.up._id.toString(),
              category: this.order.up._m_up[this.langSrv.getCurrentLang()],
              price: this.priceToPay.amount / boxQuantity,
              brand: this.order.farmerCompany,
              quantity: boxQuantity,
              variant: TrackingConstants.GTM.PARAMS.OVERHARVEST,
            },
          ],
        },
      },
      TrackingConstants.GTM.ACTIONS.REORDER
    );

    // Add to Cart
    this.cartSrv.add(
      OVERHARVEST,
      this.order.up,
      null,
      null,
      this.order.up.selectedMasterBox._id,
      // PRODUCT_MODEL
      {
        ...{ numMasterBoxes: boxQuantity },
      },
      null,
      this.order.farmerSlug
    );

    this.trackGA4AddToCart();

    // Open notification
    this.productNotificationOpen = true;
    this.popoverSrv.open('ProductNotificationComponent', 'header-notification-container', {
      inputs: {
        product: {
          type: 'OVERHARVEST',
          name: this.order._m_farmName[this.langSrv.getCurrentLang()],
          up: this.order.up,
          price: this.priceToPay?.amount,
          boxes: boxQuantity,
        },
        imageURL: this.order.up.selectedMasterBox.pictureURL,
        customClose: () => {
          this.popoverSrv.close('ProductNotificationComponent');
          this.productNotificationOpen = false;
        },
      },
      outputs: {},
    });
  }

  private getPriceLabel(): string {
    let label: string;

    if (this.isFreeDelivery) {
      label = this.translocoSrv.translate('global.free.text-info');
    } else if (this.isRecipient) {
      label = this.translocoSrv.translate('global.gift.text-info');
    }

    return label || this.getPrice();
  }

  private getPrice(): string {
    return new CFCurrencyPipe(this.countrySrv).transform(
      this.order?.amount.totalToCollect || this.order?.amount,
      this.order.currency?.crowdfarmer.currency
    );
  }

  private checkIsGift(): void {
    this.gift = this.order.gift;

    this.orderGiftCancelled =
      this.orderStatusParams.orderPaymentStatus === ORDER_PAYMENT_STATUS.ORDER_CANCELLED ||
      this.orderStatusParams.orderPaymentStatus === ORDER_PAYMENT_STATUS.ORDER_REJECTED ||
      this.orderStatusParams.orderPaymentStatus === ORDER_PAYMENT_STATUS.ORDER_REFUNDED;

    if (this.gift) {
      const isGifter = this.rolePermissions.nameOfRole === PURCHASE_ROLE.GIFTER;

      this.isRecipient = this.rolePermissions.nameOfRole === PURCHASE_ROLE.RECIPIENT;
      if (isGifter) {
        this.deliveryDate = this.order.shipment.originalArrivalDate;
      }
    }
  }

  private trackGA4AddToCart(): void {
    const PRODUCT_CODE = this.order?.up?.code;
    const items: IEcommerceTracking[] = [];
    const listName = 'Private_Zone/Boxes';
    const farmName = this.order?._m_farmName?.en;
    const boxQuantity: number = this.order?.shipment?.boxes?.length;

    items.push({
      index: this.trackingSrv.getPosition(),
      item_brand: farmName,
      currency: this.priceToPay.currency?.crowdfarmer?.currency,
      price: this.priceToPay.amount / boxQuantity,
      item_variant: TrackingConstants.ITEM_VARIANT.OH,
      quantity: boxQuantity,
      item_id: this.order?.up?._id,
      item_category: this.order?.up?._m_category?.en,
      item_category2: this.order?.up?._m_subcategory?.en,
      item_category3: this.order?.up?._m_variety?.en,
      item_category4: this.order?.up?._m_subvariety?.en,
      item_list_name: listName,
      item_name: PRODUCT_CODE,
      // cart_number_items
      // product_id: e.code, product category id ?
      product_code: PRODUCT_CODE,
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

    const currentItem: IEcommerceTracking = items[0];
    const productCode: string = currentItem && currentItem.product_code;

    productCode && this.trackingSrv.saveTrackingStorageProject(productCode, currentItem);
    this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.ADD_TO_CART, true, { items });
  }
}
