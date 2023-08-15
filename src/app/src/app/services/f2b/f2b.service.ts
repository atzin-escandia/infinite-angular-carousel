import { Injectable, Injector } from '@angular/core';

import { BaseService } from '../base';
import { F2bResource } from '@resources/f2b/f2b.resource';
import { StorageService } from '@app/services';

const COMPANY_KEY = 'f2b:company';
const REF_CODE_KEY = 'f2b:refCode';
const STORE_TIME = 86400; // 1day

@Injectable({
  providedIn: 'root',
})
export class F2bService extends BaseService {
  constructor(private f2bRsc: F2bResource, public injector: Injector, private storageSrv: StorageService) {
    super(injector);
  }

  public getCompanyBySlug(slug: string): Promise<any | null> {
    return this.f2bRsc.getCompanyBySlug(slug);
  }

  public setLeadInfo(companySlug: string, refCode = ''): void {
    this.storageSrv.set(COMPANY_KEY, companySlug, STORE_TIME);
    if (refCode) {
      this.storageSrv.set(REF_CODE_KEY, refCode, STORE_TIME);
    }
  }

  public getLeadInfo(): { companySlug: string; refCode: string | undefined } {
    return { companySlug: this.storageSrv.get(COMPANY_KEY), refCode: this.storageSrv.get(REF_CODE_KEY) };
  }

  public getCompanySlug(): string {
    return this.storageSrv.get(COMPANY_KEY);
  }

  public getRefCode(): string {
    return this.storageSrv.get(REF_CODE_KEY);
  }

  public isFromF2B(): boolean {
    return !!this.storageSrv.get(COMPANY_KEY);
  }

  public clearLead(): void {
    this.storageSrv.clear(COMPANY_KEY);
    this.storageSrv.clear(REF_CODE_KEY);
  }
}
