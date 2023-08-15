import {Injectable} from '@angular/core';

import {BaseResource} from '../base';
import {ApiResource} from '../api';
import {UnknownObjectType} from '@app/interfaces';

@Injectable({
  providedIn: 'root'
})
export class CartsResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  /**
   * Store cart in server
   */
  public store(body: any): Promise<any> {
    return this.apiRsc.post({service: 'carts/store', body});
  }

  public refreshPricesAndDates(body: any): Promise<any> {
    return this.apiRsc.post({service: 'carts/refresh-price-date', body});
  }

  /**
   * Returns cart with necessary information
   */
  public productsInfo(body: any): Promise<any> {
    return this.apiRsc.post({service: 'carts/products-info', body, loader: true});
  }

  public productsInfoV2(body: any): Promise<{
      cart: UnknownObjectType[];
      total: {
        amount: number;
        amountToPay?: number;
        creditsToSpend?: number;
      };
    }> {
    return this.apiRsc.post({service: 'carts/products-info', version: 'v3', body});
  }
}
