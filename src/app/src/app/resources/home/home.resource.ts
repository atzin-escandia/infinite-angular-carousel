import {Injectable} from '@angular/core';

import {BaseResource} from '../base';
import {ApiResource} from '../api';

@Injectable({
  providedIn: 'root'
})
export class HomeResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  /**
   * Get header home data
   */
  public async getHomeHeader(): Promise<any> {
    return await this.apiRsc.get({service: 'home/header'});
  }

  /**
   * Get header home data
   */
  public async getMediaLogos(country: string): Promise<any> {
    const params = {
      country
    };

    return await this.apiRsc.get({service: 'media-logos', params});
  }

  /**
   * Get home counters
   */
  public async getCounters(): Promise<any> {
    return await this.apiRsc.get({service: 'home/counters'});
  }

}
