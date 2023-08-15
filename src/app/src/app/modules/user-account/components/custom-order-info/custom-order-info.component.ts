import { Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { BaseComponent } from '@app/components';
import { BreadcrumbItem } from '@app/components/breadcumbs/breadcrumbs.component';
import { OrdersService, RouterService, UtilsService } from '@app/services';
import { OrderCustomBox } from '../../interfaces/order-custom-order.interface';
import { Seal, UnknownObjectType } from '@app/interfaces';
import { SealsService } from '@app/modules/e-commerce/services/seals-services';
import { first } from 'rxjs';
import { ArticleDTO } from '@app/modules/e-commerce/interfaces';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { OrderStatusDetailColorType, mapOrderStatusDetailColor, mapOrderStatusDetailMsg } from '../../utils/maps/order.map';
import { ORDER_DELIVERY_STATUS, ORDER_PAYMENT_STATUS, ORDER_TICKET_STATUS } from '@app/constants/order.constants';

@Component({
  selector: 'cf-custom-order-info',
  templateUrl: './custom-order-info.component.html',
  styleUrls: ['./custom-order-info.component.scss'],
})
export class CustomOrderInfoComponent extends BaseComponent implements OnInit, OnChanges {
  /**
   * OrderData
   */
  @Input() orderData: OrderCustomBox;

  /**
   * userData
   */
  @Input() userData: UnknownObjectType;

  /**
   * app
   */
  @Input() app: boolean;

  /**
   * checkLoginEvn, change direction and cancel order
   */
  @Output() checkLoginEvn = new EventEmitter<UnknownObjectType>();

  /**
   * Refresh Order Info
   */
  @Output() refreshOrderInfo = new EventEmitter<UnknownObjectType>();

  /**
   * breadcrumbs
   */
  breadcrumbs: BreadcrumbItem[] = [];

  /**
   * allSeals
   */
  allSeals: Seal[] = [];

  /**
   * articles
   */
  articles: ArticleDTO[];

  /**
   * cancellable
   */
  cancellable: { canBeCancelled?: boolean };
  isCancellable: boolean;

  /**
   * dayAfterEstimatedDelivery && showDeliveryBlock
   */
  dayAfterEstimatedDelivery: boolean;
  showDeliveryBlock: boolean;

  /**
   * showNotification
   */
  showNotification: boolean;

  /**
   * orderStatusDetailMsg & orderStatusDetailColor
   */
  orderStatusDetailMsg: { id: string; replacements?: UnknownObjectType };
  orderStatusDetailColor: OrderStatusDetailColorType;

  constructor(
    public injector: Injector,
    private routerSrv: RouterService,
    public utilsSrv: UtilsService,
    private sealsSrv: SealsService,
    public ordersSrv: OrdersService
  ) {
    super(injector);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.orderData.currentValue) {
      this.articles = this.createProducts(changes.orderData.currentValue.articles, changes.orderData.currentValue.products[0]);
      this.setDeliveryBlock();
      this.setStatusDetail();
      void this.canCancelOrder();
    }
  }

  ngOnInit(): void {
    this.init();
  }

  init(): void {
    this.setBreadcrumbs();
    this.getSeals();
  }

  setBreadcrumbs(): void {
    const orderNumber = this.orderData.orderNumber;

    this.breadcrumbs = [
      {
        isSelected: false,
        label: 'page.Your-orders.title',
        onClick: () => this.routerSrv.navigateToOrderList(),
      },
      {
        isSelected: true,
        label: 'global.Order-details.text-info',
        extraInfo: orderNumber,
      },
    ];
  }

  createProducts(articles: ArticleDTO[], products: ArticleDTO[]): ArticleDTO[] {
    return products.map((product) => {
      const article = articles.find((art: ArticleDTO) => art._id === product.articleId);

      return {
        ...product,
        ...article,
      };
    });
  }

  setDeliveryBlock(): void {
    dayjs.extend(isSameOrBefore);
    this.showDeliveryBlock = false;
    this.dayAfterEstimatedDelivery = false;
    if (this.orderData.shipment?.arrivalEstimateDate) {
      this.showDeliveryBlock =
        dayjs(this.orderData.shipment.arrivalEstimateDate).isSameOrBefore(dayjs(), 'day') &&
        this.orderData.orderDeliveryStatus !== ORDER_DELIVERY_STATUS.ORDER_DELIVERED;
      this.dayAfterEstimatedDelivery =
        dayjs(this.orderData.shipment.arrivalEstimateDate).isSameOrBefore(dayjs().add(1, 'day'), 'day') &&
        this.orderData.orderDeliveryStatus !== ORDER_DELIVERY_STATUS.ORDER_DELIVERED;
    }
  }

  setStatusDetail(): void {
    this.showNotification =
      [
        ORDER_DELIVERY_STATUS.ORDER_IN_TRANSIT_DELAYED,
        ORDER_DELIVERY_STATUS.UNKNOWN,
        ORDER_DELIVERY_STATUS.ORDER_DELIVERY_ERROR,
        ORDER_DELIVERY_STATUS.ORDER_DELIVERY_POINT,
      ].includes(this.orderData.orderDeliveryStatus) ||
      [
        ORDER_PAYMENT_STATUS.ORDER_REJECTED,
        ORDER_PAYMENT_STATUS.ORDER_DECLINED,
      ].includes(this.orderData.orderPaymentStatus) ||
      [
        ORDER_TICKET_STATUS.ORDER_TICKET_OPENED,
        ORDER_TICKET_STATUS.ORDER_TICKET_CLOSED
      ].includes(this.orderData.orderTicketStatus);

    const { orderDeliveryStatus, orderTicketStatus, orderPaymentStatus, orderType } = this.orderData;

    this.orderStatusDetailColor = mapOrderStatusDetailColor({ orderDeliveryStatus, orderTicketStatus, orderPaymentStatus });
    this.orderStatusDetailMsg = mapOrderStatusDetailMsg(
      {
        orderDeliveryStatus,
        orderTicketStatus,
        orderPaymentStatus,
        orderType,
      },
      this.orderData
    );
  }

  getSeals(): void {
    this.sealsSrv
      .getAll()
      .pipe(first())
      .subscribe((res) => (this.allSeals = res.list));
  }

  async canCancelOrder(): Promise<void> {
    this.cancellable = await this.ordersSrv.canBeCancelled(this.orderData._id);

    this.isCancellable = this.cancellable.canBeCancelled;
  }

  /**
   * Pass autoLogin validation
   */
  autoLoginValidation(funcName: string): void {
    this.checkLoginEvn.emit({ funcName, order: this.orderData });
  }
}
