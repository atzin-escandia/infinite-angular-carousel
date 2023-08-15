import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@modules/shared/shared.module';
import { SubscriptionSelectorModule } from '../subscription-selector/subscription-selector.module';
import { ProductSubscriptionComponent } from './product-subscription.component';

@NgModule({
  declarations: [ProductSubscriptionComponent],
  imports: [CommonModule, SharedModule, SubscriptionSelectorModule],
  exports: [ProductSubscriptionComponent],
})
export class ProductSubscriptionModule {}
