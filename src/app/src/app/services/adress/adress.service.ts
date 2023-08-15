import { Injectable, Injector } from '@angular/core';

import { BaseService } from '../base';
import { AddressResource } from '@resources/address/address.resource';

@Injectable({
  providedIn: 'root',
})
export class AddressService extends BaseService {
  constructor(private addressRsc: AddressResource, public injector: Injector) {
    super(injector);
  }

  public validate(body: any): Promise<any> {
    return this.addressRsc.validate(body);
  }

  public sendHash(validateAddress: any, status: string): Promise<any> {
    const body = {
      validateAddress,
      status,
    };

    return this.addressRsc.sendHash(body);
  }
}
