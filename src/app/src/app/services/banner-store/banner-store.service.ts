import { Injectable, Injector } from '@angular/core';

import { BaseService } from '../base';
import { StorageService } from '../storage';
@Injectable({
  providedIn: 'root',
})
export class BannerStoreService extends BaseService {
  constructor(private storageSrv: StorageService, public injector: Injector) {
    super(injector);
  }

  /**
   * Init function of bannerStore service
   */
  public init(): void {
    // Check if cookies exists on storage
    if (!this.storageSrv.get('bannerStore')) {
      this.storageSrv.set('bannerStore', { marketingAllowed: true }, this.ONE_YEAR_AND_A_QUARTER_DAYS);
    }
  }

  /**
   * Set bannerStore data
   */
  public set(bannerStore: any): void {
    this.storageSrv.set('bannerStore', bannerStore, this.ONE_YEAR_AND_A_QUARTER_DAYS);
  }

  /**
   * Get method
   */
  public get(): any {
    return this.storageSrv.get('bannerStore');
  }

  /**
   * Accept bannerStore
   */
  public accept(): void {
    this.storageSrv.set('bannerStorePopup', true, this.ONE_YEAR_AND_A_QUARTER_DAYS); // 365.25 days
  }

  /**
   * return if bannerStore alerter should be visible
   */
  public isVisible(): boolean {
    return typeof window !== 'undefined' && !this.storageSrv.get('bannerStorePopup');
  }

  private readonly ONE_YEAR_AND_A_QUARTER_DAYS = 31557600; // 365.25 days (in seconds 24*60*60*365 + 6*60*60)
}
