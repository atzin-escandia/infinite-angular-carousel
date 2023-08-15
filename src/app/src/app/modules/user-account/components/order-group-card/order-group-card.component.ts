import {Component, Input, OnInit} from '@angular/core';
import {IOrderStatusParams, ITagGroupOrder} from '../../interfaces/order.interface';
import {ORDER_PAYMENT_STATUS, ORDER_TICKET_STATUS, ORDER_STATUS} from '../../../../constants/order.constants';
import {ORDER_GENERATOR_TAG_MAP} from '../../utils/maps/order.map';
import {RouterService} from '../../../../services';
import dayjs from 'dayjs';
import {PurchaseInfoStatus} from '../../../../interfaces';

type TagLabelType = 'status' | 'ticket';

@Component({
  selector: 'order-group-card',
  templateUrl: './order-group-card.component.html',
  styleUrls: ['./order-group-card.component.scss'],
})
export class OrderGroupCardComponent implements OnInit {
  @Input() images: string[] = [];
  @Input() orderId: string;
  @Input() orderNumber: string;
  @Input() totalOrders: number;
  @Input() totalPrice: number;
  @Input() pricePaid: number;
  @Input() amountPeople: number;
  @Input() createdAt: string;
  @Input() onClick: () => void;
  /**
   * When
   * - payment not completed
   * - deadline has expired
   * - promoter no assumes the payment
   * Or canceled by the presi promoter or guests
   */
  @Input() status: PurchaseInfoStatus;
  @Input() filterCanceledState: boolean;
  /* when filter is applied */
  @Input() tag?: ITagGroupOrder;

  public orderStatusCanceled: Partial<IOrderStatusParams>;
  public tagStatus: Partial<IOrderStatusParams>;
  public tagLeftStatusLabel: string;
  public tagLeftTicketLabel: string;
  public hasBeenCancelled = false;

  constructor(public routerSrv: RouterService) {}

  ngOnInit(): void {
    if (this.status === PurchaseInfoStatus.CANCELLED || this.status === PurchaseInfoStatus.EXPIRED) {
      this.generateOrderStatusCanceled();
    }

    if (this.tag) {
      const { statusParams, textInfo, tagLabelType } = this.generateTag(this.tag);

      this.tagStatus = statusParams;

      if (tagLabelType === 'status') {
        this.tagLeftStatusLabel = textInfo;
      } else if (tagLabelType === 'ticket') {
        this.tagLeftTicketLabel = textInfo;
      }
    }

    this.createdAt = dayjs(this.createdAt).format('DD/MM/YYYY');
  }

  generateOrderStatusCanceled(): void {
    this.hasBeenCancelled = true;
    this.orderStatusCanceled = {
      orderPaymentStatus: ORDER_PAYMENT_STATUS.ORDER_CANCELLED,
      orderTicketStatus: ORDER_TICKET_STATUS.NONE,
    };
  }

  generateTag({type, affectedOrders}: ITagGroupOrder): {
    textInfo: string;
    statusParams: Partial<IOrderStatusParams>;
    tagLabelType: TagLabelType;
  } {
    let tagLabelType: TagLabelType = 'status';

    if ([ORDER_STATUS.OPEN_INCIDENT, ORDER_STATUS.CLOSED_INCIDENT].includes(type)) {
      tagLabelType = 'ticket';
    }

    return {
      tagLabelType,
      statusParams: ORDER_GENERATOR_TAG_MAP.get(type),
      textInfo: `${affectedOrders}/${this.totalOrders}`,
    };
  }

  public goToOrderDetail(): void {
    this.routerSrv.navigate(`private-zone/my-order/group-info/${this.orderId}`);
  }
}
