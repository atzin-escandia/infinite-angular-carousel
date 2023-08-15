import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentComponent } from './payment.component';
import { SharedModule } from '@modules/shared/shared.module';
import { PaymentComponentsModule } from './components/components.module';
import * as SERVICES from './services';
import * as USE_CASES from './use-cases';

const _SERVICES = [
  SERVICES.PaymentCommonService,
  SERVICES.PaymentStripeService,
  SERVICES.PaymentMethodService,
  SERVICES.PaymentCardService,
  SERVICES.PaymentPaypalService,
];

const _USE_CASES = [
  USE_CASES.PaymentUseCasesManagerService,
  USE_CASES.CardPaymentUseCaseService,
  USE_CASES.ConfirmStripeCardIntentUseCaseService,
  USE_CASES.CreatePaymentMethodUseCaseService,
  USE_CASES.CreateStripeIntentUseCaseService,
  USE_CASES.NewCardPaymentUseCaseService,
  USE_CASES.PaypalPaymentUseCaseService,
  USE_CASES.RemovePaymentMethodUseCaseService,
];

@NgModule({
  declarations: [PaymentComponent],
  imports: [
    CommonModule,
    SharedModule,
    PaymentComponentsModule
  ],
  exports: [PaymentComponent],
  providers: [..._SERVICES, ..._USE_CASES]
})
export class PaymentModule {}
