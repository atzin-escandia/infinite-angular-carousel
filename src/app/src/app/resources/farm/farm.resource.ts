import {Injectable} from '@angular/core';

import {BaseResource} from '../base';
import {ApiResource} from '../api';

@Injectable({
  providedIn: 'root'
})
export class FarmResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  public async getBySlug(slug: string): Promise<any> {
    return this.apiRsc.get({service: 'farms/slug/' + slug});
  }
}
