import {Injectable} from '@angular/core';
import {BaseResource} from '../base';
import {ApiResource} from '../api';

@Injectable({
  providedIn: 'root'
})
export class LandingsResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  /**
   * Get landing by Id
   */
  public getLandingById(id: string, draft: string): Promise<any> {
    return this.apiRsc.get({
      service: `landings/slug/${id}${draft}`,
      version: 'v2',
    });
  }
}
