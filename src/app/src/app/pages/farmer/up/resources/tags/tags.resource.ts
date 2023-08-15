import {Injectable} from '@angular/core';

import {BaseResource} from '../../../../../resources/base';
import {ApiResource} from '../../../../../resources/api';

@Injectable({
  providedIn: 'root'
})
export class TagsResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  /**
   * Get all tags
   */
  public getAll(): Promise<any> {
    return this.apiRsc.get({service: 'tags'});
  }
}
