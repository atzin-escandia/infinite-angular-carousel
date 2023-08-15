import {Injectable} from '@angular/core';
import {BaseResource} from '../base';
import {ApiResource} from '../api';
import {AddressInterface} from '../../interfaces';
import {ISubscriptionAvailability} from '../../../app/interfaces/subscription.interface';

const PAGINATION_LIMIT = 5;

@Injectable({
  providedIn: 'root',
})
export class SubscriptionResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  public getSubscriptionAvailability({
    country,
    masterBox,
    project,
  }: {
    country: string;
    masterBox: string;
    project: string;
  }): Promise<ISubscriptionAvailability> {
    return this.apiRsc.get({
      service: 'subscriptions/info',
      params: {
        country,
        masterBox,
        project,
      },
    });
  }

  public async getSubscriptions(user: string, start: number, status: any): Promise<any> {
    const params = {
      start,
      limit: 10,
      ...(status && { filter: status})
    };

    return this.apiRsc.get({service: `subscriptions/crowdfarmer/${user}`, version: 'v1', params });
  }

  public async getSubscriptionDetail(id: string, page: number): Promise <any> {
    const params = {
      start: page * PAGINATION_LIMIT,
      limit: PAGINATION_LIMIT
    };

    return this.apiRsc.get({service: `subscriptions/${id}/orders`, version: 'v1', params});
  }

  public async changeSubscriptionShipment(id: string, shipment: AddressInterface): Promise <any> {
    return this.apiRsc.put({service: `subscriptions/${id}/shipment`, version: 'v1', body: {shipment}});
  }

  public async cancelSubscription(id: string): Promise<any>  {
    return this.apiRsc.put({service: `subscriptions/${id}/cancel`, version: 'v1'});
  }

}
