import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CFDesignModule } from '@crowdfarming/cf-design';
import { AtomicModule } from '../../../../../components/_atomic/atomic.module';
import { TranslocoRootModule } from '@app/transloco/transloco-root.module';
import * as PAYMENTS from './index';

const _PAYMENTS = [
  PAYMENTS.ApplePaymentComponent,
  PAYMENTS.CardPaymentComponent,
  PAYMENTS.IdealPaymentComponent,
  PAYMENTS.SepaPaymentComponent,
];

@NgModule({
  declarations: [..._PAYMENTS],
  imports: [CommonModule, AtomicModule, FormsModule, ReactiveFormsModule, CFDesignModule, TranslocoRootModule],
  exports: [..._PAYMENTS],
})
export class PaymentsModule {}
