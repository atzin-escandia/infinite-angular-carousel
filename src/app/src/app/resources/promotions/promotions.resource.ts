import {Injectable} from '@angular/core';

import {BaseResource} from '../base';
import {ApiResource} from '../api';

@Injectable({
  providedIn: 'root'
})
export class PromotionsResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  public getAdoptionPromos(params: string): Promise<any> {
    return this.apiRsc.get({service: 'promotions', loader: false, params});
  }

  public getAdoptionPromosV2(params: string): Promise<any> {
    return this.apiRsc.get({service: 'promotions', loader: true, params, version: 'v2'});
  }

  public getOhPromos(params: string): Promise<any> {
    return this.apiRsc.get({service: 'promotions/oh', loader: false, params});
  }

  public getLanding(code: string): Promise<any> {
    return this.apiRsc.get({service: 'landings/specific/' + code, loader: false});
  }
}
