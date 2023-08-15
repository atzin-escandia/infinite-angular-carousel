import {Injectable} from '@angular/core';

import {BaseResource} from '../base';
import {ApiResource} from '../api';

@Injectable({
  providedIn: 'root'
})
export class F2bResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  public async getCompanyBySlug(slug: string): Promise<any | null> {
    try {
      return await this.apiRsc.get({ api: 'f2b', service: `companies/${slug}/by-slug` });
    } catch (e) {
      return null;
    }
  }
}
