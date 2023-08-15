import { Injectable } from '@angular/core';
import {ORDER_STATUS} from '../../constants/order.constants';
import {
  IPurchaseCart,
  IPurchaseCartFrom,
  IPurchaseCartTo,
  IPurchaseCartToAsGuest,
  IPurchaseInfo,
  IPurchaseInfoInvitation
} from '../../interfaces';
import { ApiResource } from '../api';
import { BaseResource } from '../base';

@Injectable({
  providedIn: 'root'
})
export class GroupOrderResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  getPurchaseCart(): Promise<IPurchaseCart> {
    return this.apiRsc.get({ api: 'papi', service: 'purchase-cart/current' });
  }

  createPurchaseCart(body: IPurchaseCart): Promise<IPurchaseCart> {
    return this.apiRsc.post({ api: 'papi', service: 'purchase-cart', body });
  }

  updatePurchaseCart(id: string, body: IPurchaseCart): Promise<IPurchaseCart> {
    return this.apiRsc.patch({ api: 'papi', service: `purchase-cart/${id}`, body });
  }

  purchase(body: IPurchaseCartTo): Promise<IPurchaseCartFrom> {
    return this.apiRsc.post({ api: 'papi', service: 'purchase', body });
  }

  purchaseAsGuest(cartId: string, body: IPurchaseCartToAsGuest): Promise<IPurchaseCartFrom> {
    return this.apiRsc.post({ api: 'papi', service: `purchase/${cartId}/guest-payment`, body });
  }

  getPurchaseInfoByHash(hash: string): Promise<IPurchaseInfo> {
    return this.apiRsc.get({ api: 'papi', service: `purchase?hash=${hash}` });
  }

  sendInvitation(id: string, body: IPurchaseInfoInvitation): Promise<any> {
    return this.apiRsc.post({ api: 'papi', service: `purchase/${id}/invite`, body });
  }

  cancelGroupOrder(id: string): Promise<any> {
    return this.apiRsc.post({ api: 'papi', service: `purchase/${id}/cancel`});
  }

  public promoterAssumesPayment(id: string, promoterAssumesPayment: boolean): Promise<IPurchaseInfo> {

    const body = {
      promoterAssumesPayment
    };

    return this.apiRsc.patch({service: `purchase/${id}`, version: 'v1', api: 'papi', body});
  }

  public getGroupOrderDetail(id: string): Promise<any> {
    return this.apiRsc.get({service: `orders/mine/group-orders/${id}`, version: 'v1'});
  }

  public getGroupOrderList(start: number, filter?: ORDER_STATUS): Promise<any> {
    const params: any = {
      limit: 10,
      start
    };

    if (filter) {
      params.filter = filter;
    }

    return this.apiRsc.get({service: 'orders/mine/group-orders', version: 'v1', params});
  }

  public getPurchaseInfoById(id: string): Promise<IPurchaseInfo> {
    return this.apiRsc.get({service: `purchase/${id}`, version: 'v1', api: 'papi'});
  }
}
