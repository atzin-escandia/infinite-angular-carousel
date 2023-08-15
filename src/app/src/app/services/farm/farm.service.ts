import { Injectable, Injector } from '@angular/core';

import { BaseService } from '../base';
import { FarmResource } from '../../resources';

@Injectable({
  providedIn: 'root',
})
export class FarmService extends BaseService {
  constructor(private farmRsc: FarmResource, public injector: Injector) {
    super(injector);
  }

  /**
   * Get up by slug from server
   */
  public async getBySlug(slug: string): Promise<any> {
    return await this.farmRsc.getBySlug(slug);
  }
}
