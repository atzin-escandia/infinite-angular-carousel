import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderOkRoutingModule } from './order-ok-routing.module';
import { OrderOkPageComponent } from './order-ok.page';
import { SharedModule } from '@modules/shared/shared.module';
import { PurchaseComponentsModule } from '../../components/components.module';
import { GOInvitationPopupModule } from '../../popups/go-invitation-popup/go-invitation-popup.module';
import { PurchaseServicesModule } from '../../services/purchase.module';

@NgModule({
  declarations: [OrderOkPageComponent],
  imports: [CommonModule, OrderOkRoutingModule, PurchaseComponentsModule, SharedModule, PurchaseServicesModule, GOInvitationPopupModule],
})
export class OrderOkPageModule {}
