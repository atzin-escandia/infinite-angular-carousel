import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@modules/shared/shared.module';
import { SubscriptionSelectorComponent } from './subscription-selector.component';

@NgModule({
  declarations: [SubscriptionSelectorComponent],
  imports: [CommonModule, SharedModule],
  exports: [SubscriptionSelectorComponent],
})
export class SubscriptionSelectorModule {}
