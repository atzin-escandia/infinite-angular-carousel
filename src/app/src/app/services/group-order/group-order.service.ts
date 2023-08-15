import {Injectable} from '@angular/core';
import {ORDER_STATUS} from '../../constants/order.constants';
import {ITagGroupOrder} from '../../modules/user-account/interfaces/order.interface';
import {
  IPurchaseCart,
  IPurchaseCartFrom,
  IPurchaseCartTo,
  IPurchaseCartToAsGuest,
  IPurchaseInfo,
  IPurchaseInfoInvitation,
} from '../../interfaces';
import {GroupOrderResource} from '../../resources';

@Injectable({
  providedIn: 'root',
})
export class GroupOrderService {
  constructor(private groupOrderRsc: GroupOrderResource) {}

  getPurchaseCart(): Promise<IPurchaseCart> {
    return this.groupOrderRsc.getPurchaseCart();
  }

  createPurchaseCart(body: IPurchaseCart): Promise<IPurchaseCart> {
    return this.groupOrderRsc.createPurchaseCart(body);
  }

  updatePurchaseCart(id: string, body: IPurchaseCart): Promise<IPurchaseCart> {
    return this.groupOrderRsc.updatePurchaseCart(id, body);
  }

  purchase(body: IPurchaseCartTo): Promise<IPurchaseCartFrom> {
    return this.groupOrderRsc.purchase(body);
  }

  purchaseAsGuest(cartId: string, body: IPurchaseCartToAsGuest): Promise<IPurchaseCartFrom> {
    return this.groupOrderRsc.purchaseAsGuest(cartId, body);
  }

  getPurchaseInfoByHash(hash: string): Promise<IPurchaseInfo> {
    return this.groupOrderRsc.getPurchaseInfoByHash(hash);
  }

  sendInvitation(id: string, body: IPurchaseInfoInvitation): Promise<any> {
    return this.groupOrderRsc.sendInvitation(id, body);
  }

  public cancelOrder(id: string): Promise<any> {
    return this.groupOrderRsc.cancelGroupOrder(id);
  }

  public async promoterAssumesPayment(id: string, promoterAssumesPayment: boolean): Promise<IPurchaseInfo> {
    return await this.groupOrderRsc.promoterAssumesPayment(id, promoterAssumesPayment);
  }

  public async getGroupOrderList(start: number, filter?: ORDER_STATUS): Promise<any> {
    const result = await this.groupOrderRsc.getGroupOrderList(start, filter);

    return {
      ...result,
      list: result.list.map((item) => {
        const tag: ITagGroupOrder = {
          type: filter,
          affectedOrders: item.statusAffectedOrders?.length || 0,
        };

        return {
          ...item,
          ...(tag.type && {tag}),
        };
      }),
    };
  }

  public async getGroupOrderDetail(id: string): Promise<any> {
    return await this.groupOrderRsc.getGroupOrderDetail(id);
  }

  public async getPurchaseInfoById(id: string): Promise<any> {
    return await this.groupOrderRsc.getPurchaseInfoById(id);
  }
}
