import { Component, Input } from '@angular/core';
import { OrderCustomBox } from '../../interfaces/order-custom-order.interface';
import { UtilsService } from '@app/services';
import { IOrderStatusParams } from '../../interfaces/order.interface';
import {ORDER_DELIVERY_STATUS} from '@app/constants/order.constants';

@Component({
  selector: 'cf-custom-box-summary',
  templateUrl: './custom-box-summary.component.html',
  styleUrls: ['./custom-box-summary.component.scss'],
})
export class CustomBoxSummaryComponent {
  /**
   * order custom box
   */
  order: OrderCustomBox;

  /**
   * images
   */
  images: string[];

  /**
   * orderStatusParams
   */
  orderStatusParams: IOrderStatusParams;
  orderDeliveryStatus = ORDER_DELIVERY_STATUS;

  @Input() set orderData(newValue: OrderCustomBox | undefined) {
    this.order = newValue;
    this.setImages(newValue);
    this.setOrderStatus();
  }

  constructor(private utilsSrv: UtilsService) {}

  /**
   * setImages
   * Create array images
   *
   * @param order
   */
  setImages(order: OrderCustomBox): void {
    this.images = order.products[0].map((article) => article.imgUrl);
  }

  setOrderStatus(): void {
    const { orderDeliveryStatus, orderPaymentStatus, orderTicketStatus } = this.order;
    let deliveryStatus: ORDER_DELIVERY_STATUS = orderDeliveryStatus;


    if (orderDeliveryStatus === this.orderDeliveryStatus.ORDER_PENDING) {
      deliveryStatus = this.orderDeliveryStatus.ORDER_LOGISTICS_INFO_SENT;
    }

    this.orderStatusParams = { orderDeliveryStatus: deliveryStatus, orderTicketStatus, orderPaymentStatus } as IOrderStatusParams;
  }
}
