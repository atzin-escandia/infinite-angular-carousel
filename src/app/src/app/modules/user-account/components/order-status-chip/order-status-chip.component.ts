import { Component, Injector, Input } from '@angular/core';
import { ORDER_STATUS_TRANSLATIONS, SUBSCRIPTION_STATUS, SUBSCRIPTION_STATUS_TRANSLATIONS } from '@constants/order.constants';
import { IOrderStatusParams } from '../../interfaces/order.interface';
import { BaseComponent } from '@app/components';
import { mapOrderStatus, mapOrderTicket } from '../../utils/maps/order.map';

@Component({
  selector: 'order-status-chip',
  templateUrl: './order-status-chip.component.html',
  styleUrls: ['./order-status-chip.component.scss'],
})
export class OrderStatusChipComponent extends BaseComponent {
  @Input() set statusParams(orderStatus: IOrderStatusParams | Partial<IOrderStatusParams>) {
    if (orderStatus.subscription) {
      this.setSubscriptionLabel(orderStatus);
      this.setSubscriptionCssClass(orderStatus);
    } else {
      this.getLabel(orderStatus);
      this.getCssClass(orderStatus);
    }
  }
  @Input() leftStatusLabel?: string;
  @Input() leftTicketLabel?: string;

  public label: string;
  public cssClass: string;
  public cssClassTicket: string;
  public ticketLabel: string;

  constructor(public injector: Injector) {
    super(injector);
  }

  private getLabel(params: IOrderStatusParams | Partial<IOrderStatusParams>): void {
    if (this.checkIsValidStatus(params)) {
      const orderStatus = mapOrderStatus(params);

      this.label = ORDER_STATUS_TRANSLATIONS[orderStatus];
    }

    const ticketStatus = mapOrderTicket(params);

    this.ticketLabel = ORDER_STATUS_TRANSLATIONS[ticketStatus];
  }

  private getCssClass(params: IOrderStatusParams | Partial<IOrderStatusParams>): void {
    if (this.checkIsValidStatus(params)) {
      this.cssClass = mapOrderStatus(params).toLowerCase().replace(/_/g, '-');
    }

    if (params.orderTicketStatus !== 'NONE') {
      this.cssClassTicket = mapOrderTicket(params).toLowerCase().replace(/_/g, '-');
    }
  }

  private setSubscriptionCssClass(params: any): void {
    this.cssClass = SUBSCRIPTION_STATUS[params.subscription].toLowerCase().replace(/_/g, '-');
  }

  private checkIsValidStatus(params: IOrderStatusParams | Partial<IOrderStatusParams>): boolean {
    return !!params.orderDeliveryStatus || !!params.orderPaymentStatus;
  }

  private setSubscriptionLabel(params: IOrderStatusParams | Partial<IOrderStatusParams>): void {
    this.label = SUBSCRIPTION_STATUS_TRANSLATIONS[params.subscription];
  }
}
