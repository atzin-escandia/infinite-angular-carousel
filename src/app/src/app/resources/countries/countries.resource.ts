import {Injectable} from '@angular/core';

import {BaseResource} from '../base';
import {ApiResource} from '../api';

@Injectable({
  providedIn: 'root'
})
export class CountriesResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  /**
   * Fetch countries from service
   */
  public async get(): Promise<any> {
    const countries = await this.apiRsc.get({service: 'countries'});

    return countries.list;
  }

  public async getAll(): Promise<any> {
    const countries = await this.apiRsc.get({service: 'countries/all'});

    return countries.list;
  }
}
