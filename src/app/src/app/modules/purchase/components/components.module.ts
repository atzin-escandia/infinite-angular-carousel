import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@modules/shared/shared.module';
import { CrosssellingNameModule } from '@popups/crossselling-name-popup/crossselling-name.module';
import { SubscriptionSelectorModule } from '@app/components/subscription-selector/subscription-selector.module';
import { GiftConfiguratorPopupModule } from '@popups/gift-configurator-popup/gift-configurator-popup.module';
import { AdoptionGiftSelectorModule } from '@app/components/adoption-gift-selector/adoption-gift-selector.module';
import { AtomicModule } from '../../../components/_atomic/atomic.module';
import { KlarnaPlacementModule } from './klarna-placement/klarna-placement.module';
import { PaymentsModule } from '../pages/checkout/payments/payments.module';
import { ProductSubscriptionModule } from '@components/product-subscription/product-subscription.module';
import { ImagesMosaicModule } from '@app/components';
import * as COMPONENTS from './index';

const _COMPONENNTS = [
  COMPONENTS.AddressFormComponent,
  COMPONENTS.CheckoutNavigationComponent,
  COMPONENTS.PurchaseProductComponent,
  COMPONENTS.CheckoutSummaryComponent,
  COMPONENTS.CheckoutSummaryPriceComponent,
  COMPONENTS.CountriesDropdownComponent,
  COMPONENTS.CrowdgivingComponent,
  COMPONENTS.FarmersCarouselComponent,
  COMPONENTS.FullListToggleComponent,
  COMPONENTS.CrossSellingComponent,
  COMPONENTS.CrossSellingProductComponent,
  COMPONENTS.OrderSummaryComponent,
  COMPONENTS.PaymentMethodSelectorComponent,
  COMPONENTS.UserAddressCardComponent,
  COMPONENTS.UserPaymentCardComponent,
  COMPONENTS.SplitPaymentComponent,
  COMPONENTS.CopyClipboardInputComponent,
  COMPONENTS.InputEmailsChipsComponent,
  COMPONENTS.ProductGoInvitationComponent,
  COMPONENTS.PaymentsMethodsIconsComponent,
  COMPONENTS.ImpactMessageComponent
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
    GiftConfiguratorPopupModule,
    KlarnaPlacementModule,
    ImagesMosaicModule
  ],
  exports: [..._COMPONENNTS],
})
export class PurchaseComponentsModule {}
