import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@modules/shared/shared.module';
import { CardStripeComponent } from './card/card.component';
import { IdealStripeComponent } from './ideal/ideal.component';
import { PaypalStripeComponent } from './paypal/paypal.component';
import { SepaStripeComponent } from './sepa/sepa.component';

@NgModule({
  declarations: [CardStripeComponent, SepaStripeComponent, IdealStripeComponent, PaypalStripeComponent],
  imports: [CommonModule, SharedModule, FormsModule],
  exports: [CardStripeComponent, SepaStripeComponent, IdealStripeComponent, PaypalStripeComponent],
})
export class StripeModule {}
