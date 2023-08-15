import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@modules/shared/shared.module';
import { CrosssellingNameModule } from '@popups/crossselling-name-popup/crossselling-name.module';
import { SubscriptionSelectorModule } from '@app/components/subscription-selector/subscription-selector.module';
import { GiftConfiguratorPopupModule } from '@popups/gift-configurator-popup/gift-configurator-popup.module';
import { AdoptionGiftSelectorModule } from '@app/components/adoption-gift-selector/adoption-gift-selector.module';
import { AtomicModule } from '../../../components/_atomic/atomic.module';
import { PaymentsModule } from '../payments/payments.module';
import { ProductSubscriptionModule } from '@components/product-subscription/product-subscription.module';
import * as COMPONENTS from './index';

const _COMPONENNTS = [
  COMPONENTS.FullListToggleComponent,
  COMPONENTS.PaymentMethodSelectorComponent,
  COMPONENTS.UserPaymentCardComponent,
];

@NgModule({
  declarations: [..._COMPONENNTS],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    AtomicModule,
    CrosssellingNameModule,
    GiftConfiguratorPopupModule,
    PaymentsModule,
    SubscriptionSelectorModule,
    ProductSubscriptionModule,
    AdoptionGiftSelectorModule,
    GiftConfiguratorPopupModule
  ],
  exports: [..._COMPONENNTS],
})
export class PaymentComponentsModule {}
