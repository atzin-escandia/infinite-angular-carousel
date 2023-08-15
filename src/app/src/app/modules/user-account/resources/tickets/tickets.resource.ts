import { Injectable } from '@angular/core';
import { ApiResource, BaseResource } from '../../../../resources';

@Injectable({
  providedIn: 'root'
})
export class TicketsResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  /**
   * Opens ticket
   */
  public openTicket(body: any): Promise<any> {
    return this.apiRsc.post({service: 'tickets/open', version: 'v2', body});
  }

  /**
   * Upload photos to the system
   */
  public addPhotos(body: any): Promise<any> {
    return this.apiRsc.post({service: 'tickets/add-photos', body});
  }
}
