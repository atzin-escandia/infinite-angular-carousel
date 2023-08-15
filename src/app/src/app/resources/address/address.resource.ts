import {Injectable} from '@angular/core';

import {BaseResource} from '../base';
import {ApiResource} from '../api';

@Injectable({
  providedIn: 'root'
})
export class AddressResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  public async validate(body: any): Promise<any> {
    try {
      const result = await this.apiRsc.post({service: 'addresses/validate', body});

      return result.data;
    } catch (e) {
      return {
        status: 'error'
      };
    }
  }

  public async sendHash(body: any): Promise<any> {
    const result = await this.apiRsc.post({service: 'addresses/validate-my-address', body});

    return result.data;
  }
}
