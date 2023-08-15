import {Injectable} from '@angular/core';

import {BaseResource} from '../base';
import {ApiResource} from '../api';

@Injectable({
  providedIn: 'root'
})
export class CrossSellingResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  /**
   * Get crossSlling promos. Specifications are included in body
   */
  public getCrossSellingPromos(body: string): Promise<any> {
    return this.apiRsc.post({service: 'crossselling', loader: false, body});
  }

  /**
   * Get crossSlling info for popup in adoption
   */
  public getCrossSellingAdoptionInfo(code: string): Promise<any> {
    return this.apiRsc.get({service: 'cross-selling/' + code + '/info', version: 'v2',  loader: false});
  }

  /**
   * Get crossSlling promos. Specifications are included in body
   */
  public getCrossSelling(query?: string): Promise<any> {
    return this.apiRsc.get({service: 'cross-selling' + query, version: 'v2',  loader: false});
  }
}
