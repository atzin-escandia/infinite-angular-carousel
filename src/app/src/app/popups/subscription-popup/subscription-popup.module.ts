import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionPopupComponent } from './subscription-popup.component';
import { CFDesignModule } from '@crowdfarming/cf-design';
import { TranslocoRootModule } from '@app/transloco/transloco-root.module';
import { SharedModule } from '@modules/shared/shared.module';
import { SubscriptionSelectorModule } from '@components/subscription-selector/subscription-selector.module';


@NgModule({
  declarations: [SubscriptionPopupComponent],
  imports: [CommonModule, CFDesignModule, TranslocoRootModule, SharedModule, SubscriptionSelectorModule],
  exports: [SubscriptionPopupComponent],
})
export class SubscriptionPopupModule {}
