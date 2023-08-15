import {Injectable} from '@angular/core';

import {BaseResource} from '../base';
import {ApiResource} from '../api';

@Injectable({
  providedIn: 'root'
})
export class CalendarResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  /**
   * Available dates for product
   */
  public availableDates(params: any, loader: boolean = true): Promise<any> {
    params.cartItem = JSON.stringify(params.cartItem);

    return this.apiRsc.get({service: '/calendar/available-dates', params, loader});
  }

  public masterBoxForCrowdfarmerAvailability(body: any): Promise<any> {
    return this.apiRsc.post({service: '/calendar/check-availability', body, loader: true});
  }
}
