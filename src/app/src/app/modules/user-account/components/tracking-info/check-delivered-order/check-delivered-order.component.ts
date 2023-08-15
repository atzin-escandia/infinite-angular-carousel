import { Component, EventEmitter, Input, Output } from '@angular/core';
import {ORDER_TICKET_STATUS} from '@app/constants/order.constants';
import { UnknownObjectType } from '@app/interfaces';
import { OrderCustomBox } from '@app/modules/user-account/interfaces/order-custom-order.interface';
import { GenericPopupComponent } from '@app/popups/generic-popup';
import { DomService, OrdersService } from '@app/services';
import { PopupService } from '@app/services/popup';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'cf-check-delivered-order',
  templateUrl: './check-delivered-order.component.html',
  styleUrls: ['./check-delivered-order.component.scss'],
})
export class CheckDeliveredOrderComponent {
  /**
   * OrderData
   */
  @Input() orderData: OrderCustomBox;

  @Input() dayAfterEstimatedDelivery: boolean;
  @Input() showDeliveryBlock: boolean;

  /**
   * Refresh Order Info
   */
  @Output() refreshOrderInfo = new EventEmitter<UnknownObjectType>();

  order: OrderCustomBox;

  orderticketStatus = ORDER_TICKET_STATUS;

  constructor(
    public domSrv: DomService,
    private ordersSrv: OrdersService,
    private translocoSrv: TranslocoService,
    private popupSrv: PopupService
  ) {}

  async gotBox(deliveryIssue = false): Promise<void> {
    const deliveryFeedbackInfo = {
      orderId: this.orderData._id,
      lapiInfo: this.orderData.lapiInfo,
      orderNumber: this.orderData.orderNumber,
      _boxId: this.orderData.shipment.boxes[0]._boxId,
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
}
