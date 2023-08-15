import { Injectable } from '@angular/core';
import {BaseResource} from '../base';
import {ApiResource} from '../api';

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodsResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  public async get(params: any): Promise<any> {
    const paymentMethods = await this.apiRsc.get({service: 'payment-methods', ...params});

    return paymentMethods.list;
  }
}
