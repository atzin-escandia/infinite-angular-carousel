import {Provider} from '@angular/core';
import {ErrorHandler, LOCALE_ID, APP_INITIALIZER} from '@angular/core';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {InterceptorResource} from './resources';
import {HammerConfig} from './config';
import {ErrorService} from './services/error/error.service';
import {AppInitService} from './services/app-init/init.service';

const initApp = (appInitSrv: AppInitService) => async (): Promise<boolean> =>  await appInitSrv.init();

export const APP_PROVIDERS: Provider[] = [
  AppInitService,
  { provide: ErrorHandler, useClass: ErrorService },
  { provide: HTTP_INTERCEPTORS, useClass: InterceptorResource, multi: true },
  { provide: HAMMER_GESTURE_CONFIG, useClass: HammerConfig },
  { provide: LOCALE_ID, useValue: 'de' },
  { provide: APP_INITIALIZER, useFactory: initApp, deps: [AppInitService], multi: true }
];
