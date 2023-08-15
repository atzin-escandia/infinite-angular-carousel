import {Injectable} from '@angular/core';

import {BaseResource} from '../base';
import {ApiResource} from '../api';

@Injectable({
  providedIn: 'root'
})
export class HighlightsResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  /**
   * Get order by upCf
   */
  public async getHighlights(): Promise<any> {
    return await this.apiRsc.get({service: 'highlights'});
  }
}
