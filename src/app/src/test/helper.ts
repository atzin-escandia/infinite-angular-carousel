/* eslint-disable */
import {Injector} from '@angular/core';
import {Component, EventEmitter} from '@angular/core';

import {HttpClientTestingModule} from '@angular/common/http/testing';
import {TransferState} from '@angular/platform-browser';
import {RouterTestingModule} from '@angular/router/testing';
import {RouterModule} from '@angular/router';

// import {PopupsInterface} from '../app/popups/popups.interface';
import {PopupsRef} from '../app/popups/popups.ref';

import {SeoService, StorageService} from '../app/services';
import {FormsModule} from '@angular/forms';
import {TranslocoService, TranslocoTestingModule} from '@ngneat/transloco';
import {LogglyService} from 'ngx-loggly-logger';
import {CommonModule} from "@angular/common";
// import {AngularFireRemoteConfigModule} from '@angular/fire/compat/remote-config';
import {AngularFireModule} from '@angular/fire/compat';
import {environment} from '../environments/environment';
import {
  CheckoutAnalyticsService,
  CheckoutGroupOrderService,
  CheckoutHandlersHelperService,
  CheckoutHelpersService,
  CheckoutInitHelperService,
  CheckoutNavigationHelperService,
  CheckoutPaymentApplePayService,
  CheckoutPaymentCardService,
  CheckoutPaymentCommonService,
  CheckoutPaymentIdealService,
  CheckoutPaymentPaypalService,
  CheckoutPaymentService,
  CheckoutProductsService,
  CheckoutService,
  CheckoutStoreService,
  CheckoutStripeCallbacksHelperService,
  CheckoutCommonService,
  PurchaseCoreService
} from '@modules/purchase/services';

export const providers = [Injector, TransferState, StorageService, LogglyService, SeoService, TranslocoService];
export const purchaseProviders = [PurchaseCoreService, CheckoutCommonService];
export const checkoutProviders = [
  CheckoutAnalyticsService,
  CheckoutStoreService,
  CheckoutGroupOrderService,
  CheckoutPaymentCardService,
  CheckoutPaymentCommonService,
  CheckoutPaymentPaypalService,
  CheckoutHandlersHelperService,
  CheckoutService,
  CheckoutProductsService,
  CheckoutNavigationHelperService,
  CheckoutPaymentIdealService,
  CheckoutHelpersService,
  CheckoutInitHelperService,
  CheckoutStripeCallbacksHelperService,
  CheckoutPaymentService,
  CheckoutPaymentApplePayService
];
export const popupsProviders = [PopupsRef];

export const imports = [
  RouterTestingModule,
  RouterModule,
  HttpClientTestingModule,
  FormsModule,
  TranslocoTestingModule,
  CommonModule,
  AngularFireModule.initializeApp(environment.firebase),
  // AngularFireRemoteConfigModule
];

export function setStorageService(injector: any): void {
  const storage = new StorageService(injector);

  storage.init();
}

/**
 * Mock components for testing
 */
export function MockComponent(options: Component): Component {
  const metadata: Component = {
    selector: options.selector,
    template: options.template || '',
    inputs: options.inputs,
    outputs: options.outputs || [],
    exportAs: options.exportAs || ''
  };

  class Mock { }

  metadata.outputs.forEach(method => {
    Mock.prototype[method] = new EventEmitter<any>();
  });

  return Component(metadata)(Mock as any);
}
