import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrosssellingInfoComponent } from '@popups/crossselling-info-popup';
import { SharedModule } from '@modules/shared/shared.module';
import { AtomicModule } from '../../../../../components/_atomic/atomic.module';
import { PurchaseComponentsModule } from '../../../components/components.module';
import { PaymentConfirmationPopupModule } from '@popups/payment-confirmation-popup/payment-confirmation-popup.module';
import { GOInfoPopupModule } from '../../../popups/go-info-popup/go-info-popup.module';
import { ProjectCardModule } from '@components/home/project-card/project-card.module';
import { CrossSellingBlockModule } from '@app/components';
import { PaymentsModule } from '../payments/payments.module';
import { StatusBoxModule } from '@app/components/status-box/status-box.module';
import { KlarnaPlacementModule } from '@app/modules/purchase/components/klarna-placement/klarna-placement.module';
import { CheckoutCartSectionComponent } from './cart/checkout-cart-section.component';
import { CheckoutShipmentSectionComponent } from './shipment/checkout-shipment-section.component';
import { CheckoutPaymentSectionComponent } from './payment/checkout-payment-section.component';

@NgModule({
  declarations: [
    CheckoutCartSectionComponent,
    CheckoutShipmentSectionComponent,
    CheckoutPaymentSectionComponent,
    CrosssellingInfoComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    AtomicModule,
    PurchaseComponentsModule,
    PaymentConfirmationPopupModule,
    GOInfoPopupModule,
    ProjectCardModule,
    CrossSellingBlockModule,
    PaymentsModule,
    StatusBoxModule,
    KlarnaPlacementModule,
  ],
  exports: [
    CheckoutCartSectionComponent,
    CheckoutShipmentSectionComponent,
    CheckoutPaymentSectionComponent,
  ],
})
export class CheckoutSectionsModule {}
