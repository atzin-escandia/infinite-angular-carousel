import {Injectable} from '@angular/core';

import {BaseResource} from '../base';
import {ApiResource} from '../api';

@Injectable({
  providedIn: 'root'
})
export class GiftResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  public checkInfo(project: string, masterboxId: string, country: string): Promise<any> {
    return this.apiRsc.get({
      service: `gifts/info?project=${project}&masterBoxId=${masterboxId}&country=${country}`,
      loader: false
    });
  }

  public activate(hash: string, body: {crowdfarmer: string}): Promise<any> {
    return this.apiRsc.put({
      service: 'gifts/' + hash + '/activate',
      body,
      loader: false
    });
  }

  public checkInvitation(hash: string): Promise<{available: boolean; reason?: string}> {
    return this.apiRsc.get({
      service: 'gifts/' + hash + '/invitation',
      loader: false
    });
  }
}
