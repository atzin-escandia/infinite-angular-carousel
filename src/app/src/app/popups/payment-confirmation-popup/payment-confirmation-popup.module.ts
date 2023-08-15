import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CFDesignModule } from '@crowdfarming/cf-design';
import { PaymentConfirmationPopupComponent } from './payment-confirmation-popup';

@NgModule({
  declarations: [PaymentConfirmationPopupComponent],
  imports: [CommonModule, CFDesignModule],
  exports: [PaymentConfirmationPopupComponent],
})
export class PaymentConfirmationPopupModule {}
