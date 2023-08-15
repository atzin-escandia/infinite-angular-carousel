import { Injectable, Injector } from '@angular/core';
import { BaseService } from '../base';
import { CalendarResource } from '../../resources';
import { TransferStateService } from '../transfer-state';

@Injectable({
  providedIn: 'root',
})
export class CalendarService extends BaseService {
  constructor(public injector: Injector, private transferStateSrv: TransferStateService, private calendarRsc: CalendarResource) {
    super(injector);
  }

  /**
   * Get available dates for shipment
   */
  public async getAvailableDates(country: string, product: any, loader: boolean = true): Promise<any> {
    const cartItem = {
      type: product.type,
      // Could be selectedMasterBox
      masterBox: product.masterBox,
      ...((product.oneShot || product.overharvest || product.type === 'ONE_SHOT' || product.type === 'OVERHARVEST') && {
        up: product.up._id,
      }),
      ...((product.multiShotBox || product.overharvest || product.type === 'MULTI_SHOT_SINGLE_BOXES' || product.type === 'OVERHARVEST') && {
        ums: product.ums,
      }),
      ...((product.multiShotBox ||
        product.oneShotRenew ||
        product.type === 'MULTI_SHOT_SINGLE_BOXES' ||
        product.type === 'ONE_SHOT_RENEWAL') && { upCf: product.upCf }),
    };

    const isExistingUpId = typeof product?.up?._id === 'string';

    if (!cartItem.up && isExistingUpId) {
      cartItem.up = product.up._id;
    }

    const stateKey = `calendar_${JSON.stringify({ cartItem, country })}`;
    let data = this.transferStateSrv.get(stateKey, null);

    if (data === null) {
      data = await this.calendarRsc.availableDates({ cartItem, country }, loader);
      this.transferStateSrv.set(stateKey, data);
    }

    return data.availableDates ? data.availableDates : data;
  }

  public availableDatesRaw(country: string, cartItem: any): any {
    return this.calendarRsc.availableDates({ cartItem, country });
  }

  public masterBoxForCrowdfarmerAvailability(crowdfarmer: string, mb: string, season: string): any {
    return this.calendarRsc.masterBoxForCrowdfarmerAvailability({ crowdfarmer, mb, season });
  }
}
