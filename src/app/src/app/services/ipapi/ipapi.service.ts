import {Injectable, Injector} from '@angular/core';

import {BaseService} from '../base';
import {StorageService} from '../storage';
import {IpapiResource} from '../../resources';

@Injectable({
  providedIn: 'root'
})
export class IpapiService extends BaseService {
  constructor(
    private ipapiRsc: IpapiResource, // used on me
    private storageSrv: StorageService, // used on me
    public injector: Injector) {
    super(injector);
  }

  /**
   * Init ipapi service
   */
  public init(): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const me = this;

    setTimeout(() => void this.get(me), 50);
  }

  /**
   * Get locations
   */
  public async get(me = null): Promise<any> {
    if (typeof window === 'undefined') {
      return 'de';
    }
    if (me === null) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      me = this;
    }
    if (me.storageSrv.get('location')) {
      return me.storageSrv.get('location');
    } else {
      const location = await me.ipapiRsc.get();

      // Store it
      if (!me.storageSrv.get('location')) {
        me.storageSrv.set('location', location);
      }

      return location;
    }
  }
}
