import { Injectable, Injector } from '@angular/core';

import { PricesResource } from '../../resources';
import { BaseService } from '../base';
import { TransferStateService } from '../transfer-state';

@Injectable({
  providedIn: 'root',
})
export class PricesService extends BaseService {
  constructor(private priceRsc: PricesResource, private transferStateSrv: TransferStateService, public injector: Injector) {
    super(injector);
  }

  /**
   * Get prices of masterbox
   */
  public async get(up: any, location: string, type?: string, numberBoxes?: number, upCfId?: string): Promise<any> {
    const body: any = {
      cartItem: this.buildCartItem(up, type, numberBoxes, upCfId),
      country: location,
    };

    const stateKey = `price_${JSON.stringify(body)}`;
    let data = this.transferStateSrv.get(stateKey, null);

    if (data === null) {
      data = await this.priceRsc.get(body);
      this.transferStateSrv.set(stateKey, data);
    }

    return data;
  }

  public async getTotal(cartItems: any[], location: string, guestsNumber?: number): Promise<number> {
    const body: any = {
      cart: cartItems,
      country: location,
      ...(guestsNumber && { groupOrder: { guestsNumber } }),
    };

    const { total } = await this.priceRsc.getTotal(body);

    return total.amount;
  }

  public buildCartItem(up: any, type?: string, numberBoxes?: number, upCfId?: string): any {
    return {
      masterBox: up.selectedMasterBox ? up.selectedMasterBox._id : up.masterBoxes[0]._id, // TODO: [0] in masterbox is evil
      type,
      up: up._id,
      // PRODUCT_MODEL
      ...((numberBoxes && type === 'OVERHARVEST') || type === 'MULTI_SHOT_SINGLE_BOXES'
        ? { numMasterBoxes: numberBoxes }
        : { stepMS: numberBoxes }),
      ...(upCfId && { upCf: upCfId }),
    };
  }
}
