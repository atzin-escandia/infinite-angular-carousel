import { Injectable, Injector } from '@angular/core';

import { BaseService } from '../base';
import { PromotionsResource } from '../../resources';
import { TransferStateService } from '../transfer-state';

@Injectable({
  providedIn: 'root',
})
export class PromotionsService extends BaseService {
  constructor(private promotionsRsc: PromotionsResource, private transferStateSrv: TransferStateService, public injector: Injector) {
    super(injector);
  }

  public async getAdoptionPromos(params: string): Promise<any> {
    let promotions = await this.promotionsRsc.getAdoptionPromos(params);

    // Modelize it
    promotions = this.modelize(promotions);

    return promotions;
  }

  public async getAdoptionPromosV2(params: string): Promise<any> {
    return await this.promotionsRsc.getAdoptionPromosV2(params);
  }

  public async getOhPromos(params: string): Promise<any> {
    let promotions = await this.promotionsRsc.getOhPromos(params);

    // Modelize it
    promotions = this.modelize(promotions);

    return promotions;
  }

  public async getLanding(code: string): Promise<any> {
    const stateKey = `landing_${code}`;
    let landing = this.transferStateSrv.get(stateKey, null);

    if (landing === null) {
      landing = await this.promotionsRsc.getLanding(code);
      this.transferStateSrv.set(stateKey, landing);
    }

    return landing;
  }
}
