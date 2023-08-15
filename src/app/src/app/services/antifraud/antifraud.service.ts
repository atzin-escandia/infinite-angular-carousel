import { Injectable, Injector } from '@angular/core';

import { BaseService } from '../base';
import { AntifraudResource } from '../../resources/antifraud';

@Injectable({
  providedIn: 'root',
})
export class AntifraudService extends BaseService {
  constructor(public injector: Injector, private antifraudRsc: AntifraudResource) {
    super(injector);
  }

  public async check(fingerprint: string, countries: any[], crowdfarmer: string, totalPrice: number, isSepa: boolean): Promise<boolean> {
    const isAllowed = await this.antifraudRsc.check({ fingerprint, countries, crowdfarmer, totalPrice, isSepa });

    if (isAllowed && isAllowed.hasOwnProperty('isAvailable')) {
      return isAllowed.isAvailable;
    }

    return isAllowed;
  }
}
