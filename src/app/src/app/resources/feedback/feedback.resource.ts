import {Injectable} from '@angular/core';

import {BaseResource} from '../base';
import {ApiResource} from '../api';

@Injectable({
  providedIn: 'root'
})
export class FeedbackResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  public get(): Promise<any> {
    return this.apiRsc.get({
      service: 'reviews/highlight-reviews',
      loader: false
    });
  }
}
