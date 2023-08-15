import {Injectable} from '@angular/core';

import {BaseResource} from '../base';
import {ApiResource} from '../api';

@Injectable({
  providedIn: 'root'
})
export class FarmerResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  public getBySlug(slug: string): Promise<any> {
    return this.apiRsc.get({service: 'farmers/slug/' + slug});
  }
}
