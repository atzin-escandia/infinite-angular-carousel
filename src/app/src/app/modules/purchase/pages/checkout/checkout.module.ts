import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutRoutingModule } from './checkout-routing.module';
import { CheckoutPageComponent } from './checkout.page';
import { CheckoutSectionsModule } from './sections/checkout-sections.module';
import { PurchaseComponentsModule } from '../../components/components.module';
import { SharedModule } from '@modules/shared/shared.module';
import { PurchaseServicesModule } from '../../services/purchase.module';
import { CrossSellingBlockModule } from '@app/components';
import { ProjectCardModule } from '@components/home/project-card/project-card.module';

@NgModule({
  declarations: [CheckoutPageComponent],
  imports: [
    CommonModule,
    CheckoutRoutingModule,
    PurchaseServicesModule,
    PurchaseComponentsModule,
    CheckoutSectionsModule,
    SharedModule,
    CrossSellingBlockModule,
    ProjectCardModule,
  ],
  exports: [CheckoutPageComponent],
})
export class CheckoutPageModule {}
