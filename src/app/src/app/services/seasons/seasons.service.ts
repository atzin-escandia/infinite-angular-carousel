import { Injectable, Injector } from '@angular/core';

import { BaseService } from '../base';
import { TransferStateService } from '../transfer-state';
import { SeasonsResource } from '../../resources';

@Injectable({
  providedIn: 'root',
})
export class SeasonsService extends BaseService {
  constructor(private seasonRsc: SeasonsResource, private transferStateSrv: TransferStateService, public injector: Injector) {
    super(injector);
  }

  /**
   * Get season by id
   */
  public async get(id: string): Promise<any> {
    const stateKey = `seasons_${id}`;
    let season = this.transferStateSrv.get(stateKey, null);

    if (season === null) {
      season = await this.seasonRsc.get(id);
      this.transferStateSrv.set(stateKey, season);
    }

    return season;
  }

  /**
   * Get season max units in up by up id
   */
  public async getMaxUnits(id: string): Promise<any> {
    return await this.seasonRsc.getMaxUnits(id);
  }
}
