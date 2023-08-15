import { Injectable } from '@angular/core';
import { CheckoutAnalyticsService } from './analytics/analytics.service';
import { CheckoutService } from './checkout/checkout.service';
import { CheckoutCommonService } from './common/common.service';
import { CheckoutGroupOrderService } from './group-order/group-order.service';
import { CheckoutProductsService } from './products/checkout-products.service';
import { CheckoutStoreService } from './store/checkout-store.service';
import {
  CheckoutPaymentApplePayService,
  CheckoutPaymentCardService,
  CheckoutPaymentCommonService,
  CheckoutPaymentIdealService,
  CheckoutPaymentPaypalService,
} from './payment';
import {
  CheckoutCartControllerService,
  CheckoutPaymentControllerService,
  CheckoutShipmentControllerService,
  CheckoutStripeCallbacksControllerService,
  CheckoutStripeIntentsControllerService,
} from './controllers';
import { CheckoutInitService } from './init/init.service';
import { CheckoutHandlersService } from './handlers/handlers.service';
import { CheckoutHelpersService } from './helpers/helpers.service';
import { CheckoutNavigationService } from './navigation/navigation.service';

@Injectable()
export class PurchaseCoreService {
  core: CheckoutService;
  common: CheckoutCommonService;
  store: CheckoutStoreService;
  init: CheckoutInitService;
  analytics: CheckoutAnalyticsService;
  groupOrder: CheckoutGroupOrderService;
  handlers: CheckoutHandlersService;
  helpers: CheckoutHelpersService;
  navigation: CheckoutNavigationService;
  products: CheckoutProductsService;

  payments: {
    common: CheckoutPaymentCommonService;
    applePay: CheckoutPaymentApplePayService;
    card: CheckoutPaymentCardService;
    paypal: CheckoutPaymentPaypalService;
    ideal: CheckoutPaymentIdealService;
  };

  controllers: {
    cart: CheckoutCartControllerService;
    shipment: CheckoutShipmentControllerService;
    payment: CheckoutPaymentControllerService;
    stripeCallbacks: CheckoutStripeCallbacksControllerService;
    stripeIntents: CheckoutStripeIntentsControllerService;
  };

  constructor(
    public checkoutAnalyticsSrv: CheckoutAnalyticsService,
    private checkoutSrv: CheckoutService,
    private checkoutCommonSrv: CheckoutCommonService,
    private checkoutStoreSrv: CheckoutStoreService,
    private checkoutInitSrv: CheckoutInitService,
    private checkoutGroupOrderSrv: CheckoutGroupOrderService,
    private checkoutHelpersSrv: CheckoutHelpersService,
    private checkoutHandlersSrv: CheckoutHandlersService,
    private checkoutNavigationSrv: CheckoutNavigationService,
    private checkoutProductsSrv: CheckoutProductsService,
    private checkoutPaymentApplePaySrv: CheckoutPaymentApplePayService,
    private checkoutPaymentCardSrv: CheckoutPaymentCardService,
    private checkoutPaymentCommonSrv: CheckoutPaymentCommonService,
    private checkoutPaymentIdealSrv: CheckoutPaymentIdealService,
    private checkoutPaymentPaypalSrv: CheckoutPaymentPaypalService,
    private checkoutCartControllerSrv: CheckoutCartControllerService,
    private checkoutShipmentControllerSrv: CheckoutShipmentControllerService,
    private checkoutPaymentControllerSrv: CheckoutPaymentControllerService,
    private checkoutStripeCallbacksSrv: CheckoutStripeCallbacksControllerService,
    private checkoutStripeIntentsSrv: CheckoutStripeIntentsControllerService
  ) {
    this.core = this.checkoutSrv;
    this.common = this.checkoutCommonSrv;
    this.store = this.checkoutStoreSrv;
    this.init = this.checkoutInitSrv;
    this.analytics = this.checkoutAnalyticsSrv;
    this.groupOrder = this.checkoutGroupOrderSrv;
    this.handlers = this.checkoutHandlersSrv;
    this.helpers = this.checkoutHelpersSrv;
    this.navigation = this.checkoutNavigationSrv;
    this.products = this.checkoutProductsSrv;

    this.payments = {
      common: this.checkoutPaymentCommonSrv,
      applePay: this.checkoutPaymentApplePaySrv,
      card: this.checkoutPaymentCardSrv,
      paypal: this.checkoutPaymentPaypalSrv,
      ideal: this.checkoutPaymentIdealSrv,
    };

    this.controllers = {
      cart: this.checkoutCartControllerSrv,
      shipment: this.checkoutShipmentControllerSrv,
      payment: this.checkoutPaymentControllerSrv,
      stripeCallbacks: this.checkoutStripeCallbacksSrv,
      stripeIntents: this.checkoutStripeIntentsSrv,
    };
  }
}
