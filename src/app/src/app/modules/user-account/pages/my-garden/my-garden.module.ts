import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyGardenRoutingModule } from './my-garden-routing.module';
import { MyGardenPageComponent } from './my-garden.page';
import { SharedModule } from '@modules/shared/shared.module';
import { GenericPopupModule } from '@popups/generic-popup/generic-popup.module';
import { PlanShipmentPopupModule } from '../../popups/plan-shipment/plan-shipment.module';
import { UserAccountComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    MyGardenPageComponent,
  ],
  imports: [
    CommonModule,
    MyGardenRoutingModule,
    SharedModule,
    UserAccountComponentsModule,
    // Popups
    GenericPopupModule,
    PlanShipmentPopupModule
  ]
})
export class MyGardenModule { }
