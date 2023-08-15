import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrderGroupInfoRoutingModule } from './order-group-info-routing.module';
import { OrderGroupInfoPageComponent } from './order-group-info.page';
import { SharedModule } from '@modules/shared/shared.module';
import { OrderAddressPopupModule } from '@popups/order-address-popup/order-address-popup.module';
import { ConfirmationPopupModule } from '@popups/confirmation-popup/confirmation-popup.module';
import { GenericPopupModule } from '@popups/generic-popup/generic-popup.module';
import { StatusPopupModule } from '@popups/status-popup/status-popup.module';
import { UserAccountComponentsModule } from '../../../components/components.module';

@NgModule({
  declarations: [OrderGroupInfoPageComponent],
  imports: [
    CommonModule,
    OrderGroupInfoRoutingModule,
    SharedModule,
    UserAccountComponentsModule,
    // Popups
    OrderAddressPopupModule,
    ConfirmationPopupModule,
    GenericPopupModule,
    StatusPopupModule,
  ],
})
export class OrderGroupInfoModule {}
