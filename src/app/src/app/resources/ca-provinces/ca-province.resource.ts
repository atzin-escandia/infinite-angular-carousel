import {Injectable} from '@angular/core';

import {BaseResource} from '../base';
import {ApiResource} from '../api';

@Injectable({
  providedIn: 'root'
})
export class CaProvincesResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  /**
   * Fetch states from service
   */
  public async get(): Promise<any> {
    const provinces = await this.apiRsc.get({service: 'ca-provinces'});

    return provinces.list;
  }
}
