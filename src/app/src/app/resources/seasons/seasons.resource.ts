import {Injectable} from '@angular/core';

import {BaseResource} from '../base';
import {ApiResource} from '../api';

@Injectable({
  providedIn: 'root'
})
export class SeasonsResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  /**
   * Get season by id
   */
  public get(id: string): Promise<any> {
    return this.apiRsc.get({service: 'seasons/public/' + id});
  }

  /**
   * Get max units of up in season
   */
  public getMaxUnits(id: string): Promise<any> {
    return this.apiRsc.get({service: 'seasons/by-up/' + id});
  }
}
