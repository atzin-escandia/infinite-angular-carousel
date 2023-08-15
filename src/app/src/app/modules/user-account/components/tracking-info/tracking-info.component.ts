import { Component, Input } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { environment } from 'src/environments/environment';
import { OrderCustomBox } from '../../interfaces/order-custom-order.interface';
import { TextService } from '@app/services';
import { ORDER_DELIVERY_STATUS } from '@app/constants/order.constants';
import { UnknownObjectType } from '@app/interfaces';

@Component({
  selector: 'cf-tracking-info',
  templateUrl: './tracking-info.component.html',
  styleUrls: ['./tracking-info.component.scss'],
})
export class TrackingInfoComponent {
  @Input() orderData: OrderCustomBox;

  /**
   * userData
   */
  @Input() set userData(newValue: UnknownObjectType) {
    this.user = newValue;
    this.setTypeFormLink();
  }

  orderStatus = ORDER_DELIVERY_STATUS;
  user: UnknownObjectType;
  openIncidentLink: string;

  constructor(public textSrv: TextService) {}

  getCheckStatus(): boolean {
    const isDelivered = [
      ORDER_DELIVERY_STATUS.ORDER_DELIVERED,
      ORDER_DELIVERY_STATUS.ORDER_DELIVERY_POINT,
      ORDER_DELIVERY_STATUS.ORDER_DELIVERY_ERROR,
    ].includes(this.orderData.orderDeliveryStatus);

    return isDelivered;
  }

  setTypeFormLink(): void {
    const params = {
      email: this.user.email,
      name: this.user.name + ' ' + this.user.surnames,
      product_id: this.orderData.orderNumber,
      user_id: this.user._id,
    };

    let stringParams = '';

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    Object.keys(params).forEach((key) => (stringParams = `${stringParams}${key}=${params[key]}&`));

    this.openIncidentLink = `https://crowdfarming.typeform.com/to/${environment.openIncident.typeformCode}#${stringParams}`;
  }
}
