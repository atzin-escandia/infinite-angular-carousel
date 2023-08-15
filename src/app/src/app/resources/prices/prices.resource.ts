import {Injectable} from '@angular/core';

import {BaseResource} from '../base';
import {ApiResource} from '../api';
import {UnknownObjectType} from '@app/interfaces';

@Injectable({
  providedIn: 'root'
})
export class PricesResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  public get(params: any): Promise<any> {
    params.cartItem = JSON.stringify(params.cartItem);

    return this.apiRsc.get({service: 'prices/price', params});
  }

  public getTotal(
    body: { cartItems: UnknownObjectType[]; location: string; guestsNumber?: number }
  ): Promise<{ cart: UnknownObjectType[]; total: { amount: number } }> {
    return this.apiRsc.post({service: 'prices/total', body});
  }
}
