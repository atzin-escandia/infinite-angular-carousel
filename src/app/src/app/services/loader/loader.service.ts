import { Injectable, Injector } from '@angular/core';

import { BaseService } from '../base';

@Injectable({
  providedIn: 'root',
})
export class LoaderService extends BaseService {
  // Loader/spinner
  private loading = true;

  constructor(public injector: Injector) {
    super(injector);
  }

  /**
   * Show or hide spinner
   */
  public setLoading(set: boolean): void {
    this.loading = set;

    if (this.isPlatformBrowser() && !this.loading && document.querySelector('.bgLoader')) {
      const loading: any = document.querySelector('.bgLoader');

      loading.style.opacity = 0;

      setTimeout(() => {
        if (loading.parentNode) {
          loading.parentNode.removeChild(loading);
        }
      }, 500);
    }
  }

  /**
   * Retrieve the loader status
   */
  public isActive(): boolean {
    return this.loading || null;
  }

  /**
   * Check if platform is a browser
   */
  private isPlatformBrowser(): boolean {
    return typeof window === 'object';
  }
}
