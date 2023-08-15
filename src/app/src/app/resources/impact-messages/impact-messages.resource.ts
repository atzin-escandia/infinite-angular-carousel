import { Injectable } from '@angular/core';
import { BaseResource } from '../base';
import { ApiResource } from '../api';

@Injectable({
  providedIn: 'root',
})
export class ImpactMessagesResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  /**
   * Get all impact messages
   */
  public async getAllImpactMessages(): Promise<unknown> {
    return this.apiRsc.get({
      service: `impact-messages/public`,
      version: 'v1',
    });
  }
}
