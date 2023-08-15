import { Injectable, Injector } from '@angular/core';

import { BaseService } from '../base';
import { USStatesResource } from '../../resources';

@Injectable({
  providedIn: 'root',
})
export class USStatesService extends BaseService {
  constructor(private usStatesRsc: USStatesResource, public injector: Injector) {
    super(injector);
  }

  /**
   * Get states
   */
  public async get(): Promise<any> {
    return await this.usStatesRsc.get();
  }
}
