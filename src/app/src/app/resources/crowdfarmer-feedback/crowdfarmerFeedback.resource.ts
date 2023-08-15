import {Injectable} from '@angular/core';

import {BaseResource} from '../base';
import {ApiResource} from '../api';

@Injectable({
  providedIn: 'root'
})
export class CrowdfarmerFeedbackResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  // Mandatory implementation
  public init: any = () => null;

  public sendFormInfo(formData: any): Promise<any> {
    return this.apiRsc.post({
      service: 'feedbacks',
      body: formData,
      loader: false
    });
  }
}
