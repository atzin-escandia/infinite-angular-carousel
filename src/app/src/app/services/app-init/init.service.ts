
import {Injectable} from '@angular/core';
import {IpapiService} from '../ipapi';
import {DomService} from '../dom';
import {StorageService} from '../storage/storage.service';
import {ErrorService} from '../error/error.service';

@Injectable({
  providedIn: 'root'
})
export class AppInitService {

  constructor(
    private domSrv: DomService,
    private storageSrv: StorageService,
    private ipapiSrv: IpapiService,
    private errorSrv: ErrorService,
  ) {}

  async init(): Promise<boolean> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        this.domSrv.isPlatformBrowser() && await this._initPlatformBrowserStuff();
        resolve(true);
      } catch (err) {
        this.errorSrv.handleError(err);
        reject(false);
      }
    });
  }

  private async _initPlatformBrowserStuff(): Promise<void> {
    this.generateTabId();
    await this.ipapiSrv.get();
  }

  private generateTabId(): void {
    const tabId = btoa(new Date().getTime().toString());

    this.storageSrv.set('tabId', tabId, 0, null, 2);
  }
}
