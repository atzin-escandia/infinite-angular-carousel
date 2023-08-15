import {HostListener, Injectable, Injector} from '@angular/core';
import {LogglyService} from 'ngx-loggly-logger';
import {BaseService} from '../base';

import {environment} from '../../../environments/environment';
import {StorageService} from '../';
import {DeviceDetectorService} from 'ngx-device-detector';
import {Router} from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class LoggerService extends BaseService {
  @HostListener('window:WindowOnError')
  onWindowOnError(event: any): void {
    this.error(event.detail.message);
  }

  active = false;

  constructor(
    public injector: Injector,
    private logglyService: LogglyService,
    private storageSrv: StorageService,
    private deviceService: DeviceDetectorService,
    private router: Router
  ) {
    super(injector);
    this.active = !!environment.loggly?.active && typeof window === 'object';
  }

  /**
   * Init logger sercive
   */
  public init(): void {
    this.createSessionId();

    if (this.active) {
      try {
        this.logglyService.push({
          logglyKey: environment.loggly.logglyKey,
          sendConsoleErrors: environment.loggly.sendConsoleErrors,
          json: true,
          tag: environment.loggly.tag,
          useDomainProxy: true
        });
      } catch (error) {
        console.error(error);
      }
    }
  }

  public createSessionId(force: boolean = false, user?: any): void {
    if ((!this.storageSrv.get('sessionId', 2) || force) && typeof window === 'object') {
      const deviceInfo = this.deviceService.getDeviceInfo();

      const sessionId = btoa(new Date().getTime() + '_$_' + deviceInfo.os + '_$_' +
        deviceInfo.browser + '_$_' + deviceInfo.browser_version + '_$_' + (user ? user._id : null));

      this.storageSrv.set('sessionId', sessionId, 0, null, 2);
      if (environment.production !== true) {
        console.log('Starting session');
      }
    }
  }

  public fecthParams(extra?: any): any {
    const deviceInfo = this.deviceService.getDeviceInfo();
    const userId = this.storageSrv.getCurrentUser()?._id || null;
    const deviceId = this.storageSrv.getDeviceId() || null;
    const currentCountry = this.storageSrv.get('location') || null;
    const sessionId = this.storageSrv.get('sessionId', 2);

    return {
      'x-browser': deviceInfo.browser + ' ' + deviceInfo.browser_version,
      'x-device': this.deviceService.isMobile() ? 'mobile' : this.deviceService.isTablet() ? 'tablet' : 'desktop',
      'x-userId': userId,
      'x-sessionId': sessionId || null,
      'x-country': currentCountry || 'Not detected',
      'x-device-id': deviceId || null,
      'x-os': deviceInfo.os,
      path: this.router.url,
      ...extra
    };
  }

  public log(message: string, extra?: any): void {
    try {
      if (message) {
        if (!environment.production) {
          console.log(message, extra);
        }

        if (this.active) {
          this.logglyService.push({level: 'info', message, timestamp: new Date().getTime(), ...this.fecthParams(extra)});
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  public error(message: string, extra?: any): void {
    try {
      if (message) {
        if (!environment.production) {
          console.error(message, extra);
        }

        if (this.active) {
          this.logglyService.push({level: 'error', message, timestamp: new Date().getTime(), ...this.fecthParams(extra)});
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  public warning(message: string, extra?: any): void {
    try {
      if (message) {
        if (!environment.production) {
          console.log(message, extra);
        }

        if (this.active) {
          this.logglyService.push({level: 'warning', message, timestamp: new Date().getTime(), ...this.fecthParams(extra)});
        }
      }
    } catch (err) {
      console.error(err);
    }
  }
}
