import { NgModule } from '@angular/core';
import { CheckoutCommonService } from './common/common.service';
import { TranslationPipe } from '@app/pipes/translation';
import * as SERVICES from './index';

const _SERVICES = [
  SERVICES.PurchaseCoreService,
  SERVICES.CheckoutService,
  SERVICES.CheckoutStoreService,
  SERVICES.CheckoutAnalyticsService,
  SERVICES.CheckoutGroupOrderService,
  SERVICES.CheckoutHandlersService,
  SERVICES.CheckoutHelpersService,
  SERVICES.CheckoutInitService,
  SERVICES.CheckoutNavigationService,
  SERVICES.CheckoutProductsService,
  SERVICES.CheckoutPaymentApplePayService,
  SERVICES.CheckoutPaymentCardService,
  SERVICES.CheckoutPaymentCommonService,
  SERVICES.CheckoutPaymentIdealService,
  SERVICES.CheckoutPaymentPaypalService,
  SERVICES.CheckoutPaymentKlarnaService,
  SERVICES.CheckoutCartControllerService,
  SERVICES.CheckoutShipmentControllerService,
  SERVICES.CheckoutPaymentControllerService,
  SERVICES.CheckoutStripeCallbacksControllerService,
  SERVICES.CheckoutStripeIntentsControllerService,
];

@NgModule({
  providers: [..._SERVICES, CheckoutCommonService, TranslationPipe],
})
export class PurchaseServicesModule {}
