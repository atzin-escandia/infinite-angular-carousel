import { Injectable, Injector } from '@angular/core';

import { BaseService } from '../base';
import { CaProvincesResource } from '../../resources/ca-provinces';

@Injectable({
  providedIn: 'root',
})
export class CaProvincesService extends BaseService {
  constructor(private caProvinceRsc: CaProvincesResource, public injector: Injector) {
    super(injector);
  }

  /**
   * Get states
   */
  public async get(): Promise<any> {
    return await this.caProvinceRsc.get();
  }
}
