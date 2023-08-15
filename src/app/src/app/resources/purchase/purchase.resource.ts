import {Injectable} from '@angular/core';

import {BaseResource} from '../base';
import {ApiResource} from '../api';

@Injectable({
  providedIn: 'root'
})
export class PurchaseResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  /**
   * Validate cart against server
   */
  public validate(body: any): Promise<any> {
    return this.apiRsc.post({service: 'carts/validate', body, loader: true});
  }

  /**
   * Validate cart against server
   */
  public validateAuth(body: any): Promise<any> {
    return this.apiRsc.post({service: 'carts/validate/auth', body, loader: true});
  }

  /**
   * Validate cart against server
   */
  public order(body: any): Promise<any> {
    return this.apiRsc.post({service: 'orders/purchase', version: 'v2', body, loader: true});
  }
}
