import {Injectable} from '@angular/core';

import {BaseResource} from '../base';
import {ApiResource} from '../api';

@Injectable({
  providedIn: 'root'
})
export class AntifraudResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  public async check(body: any): Promise<any> {
    try {
      return await this.apiRsc.post({service: '/antifraud/', body, loader: true});
    } catch (error) {
      console.log(error);
    }
  }
}
