import {Injectable} from '@angular/core';

import {BaseResource} from '../base';
import {ApiResource} from '../api';

@Injectable({
  providedIn: 'root'
})
export class USStatesResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  /**
   * Fetch states from service
   */
  public async get(): Promise<any> {
    const states = await this.apiRsc.get({service: 'us-states'});

    return states.list;
  }
}
