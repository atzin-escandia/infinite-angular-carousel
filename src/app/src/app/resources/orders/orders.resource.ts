import {Injectable} from '@angular/core';

import {BaseResource} from '../base';
import {ApiResource} from '../api';

@Injectable({
  providedIn: 'root'
})
export class OrdersResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  /**
   * Get order by upCf
   */
  public getByUpCf(upCfId: string, start: number): Promise<any> {
    return this.apiRsc.post({
      service: 'orders/mine-upcf/' + upCfId,
      version: 'v2',
      params: {start, limit: 10, upCfId}
    });
  }

  /**
   * Get my orders
   */
  public getUserOrders(start: number, stateFilter: string): Promise<any> {
    const params: any = {
      start,
      limit: 10,
      showCG: true,
    };

    if (stateFilter) {
      params.stateFilter = stateFilter;
    }

    return this.apiRsc.post({service: 'orders/mine', version: 'v2', params});
  }

  /**
   * Get order
   */
  public get(id: string, lapiInfo: boolean): Promise<any> {
    return this.apiRsc.post({service: 'orders/mine/' + id, version: 'v2', params: {lapiInfo}});
  }

  /**
   * Change address
   */
  public changeAddress(id: string, address: any): Promise<any> {
    return this.apiRsc.put({service: 'orders/' + id + '/address', version: 'v2', body: {address}});
  }

  /**
   * Change dates
   */
  public changeDate(id: string, newArrivalDate: string): Promise<any> {
    return this.apiRsc.put({service: 'orders/' + id + '/dates', version: 'v2', body: {newArrivalDate}});
  }

  /**
   * Cancel order
   */
  public cancelOrder(id: string): Promise<any> {
    return this.apiRsc.put({service: 'orders/' + id + '/cancel', version: 'v2'});
  }

  /**
   * Cancel order
   */
  public getDisputed(): Promise<any> {
    return this.apiRsc.get({service: 'orders/disputed', version: 'v2'});
  }

  /*
   * Gets if an order can be cancelled.
   * @param id
   */
  public cancellableOrder(id: string): Promise<any> {
    return this.apiRsc.get({service: 'orders/' + id + '/cancellable', version: 'v1'});
  }

  /**
   * Changes order delivery status in capi/lapi or opens automatic ticket if not arrived after deliveryDate
   */
  public deliveryFeedback(deliveryFeedbackInfo: any): Promise<any> {
    if (!deliveryFeedbackInfo.channel) {
      deliveryFeedbackInfo.channel = 'WEB';
    }

    return this.apiRsc.put({service: 'orders/delivery-feedback', version: 'v2', body: {deliveryFeedbackInfo}});
  }
}
