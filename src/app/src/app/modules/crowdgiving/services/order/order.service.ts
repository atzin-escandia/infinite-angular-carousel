import { Injectable } from '@angular/core';
import { ICGOrder, ICGOrderCrowdgiving } from '../../interfaces/order.interface';
import { IStorageLastPaymentPurchase, PAYMENT_METHOD, UnknownObjectType } from '@app/interfaces';
import { PurchaseService } from '@app/services';
import { CrowdgivingStoreService } from '../../store/store.service';
import { IOrderPayment } from '@app/interfaces/order.interface';

@Injectable()
export class CrowdgivingOrderService {

  constructor(
    private purchaseSrv: PurchaseService,
    private cgStoreSrv: CrowdgivingStoreService,
  ) { }

  async generateOrder(crowdgiving: ICGOrderCrowdgiving, paymentMethod: IOrderPayment, price: number): Promise<IStorageLastPaymentPurchase> {
    const orderData = this.getOrderData(crowdgiving, paymentMethod, price);
    const orderResult = await this.purchaseSrv.order(orderData);

    return orderResult;
  }

  private getOrderData(crowdgiving: ICGOrderCrowdgiving, paymentMethod: IOrderPayment, price: number): ICGOrder {
    const orderData: ICGOrder = {
      crowdgiving,
      cart: this.cgStoreSrv.cart,
      paymentMethod,
      price
    };

    return orderData;
  }
}
