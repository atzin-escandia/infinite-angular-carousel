import {Injectable} from '@angular/core';

import {BaseResource} from '../base';
import {ApiResource} from '../api';

@Injectable({
  providedIn: 'root'
})
export class SearchResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  /**
   * Get all seals
   */
  public predictive(params: {search: string; lang: string}): Promise<any> {
    return this.apiRsc.get({service: 'synonyms/predictive', loader: false, params});
  }

  /**
   * Get all seals
   */
  public search(params: {search: string; lang: string; country: string }): Promise<any> {
    return this.apiRsc.get({service: 'elastic/documents', loader: true, params});
  }
}
