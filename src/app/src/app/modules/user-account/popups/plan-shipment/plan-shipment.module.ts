import { CommonModule } from '@angular/common';
import { CFDesignModule } from '@crowdfarming/cf-design';
import { NgModule } from '@angular/core';
import { PlanShipmentPopupComponent } from './plan-shipment.component';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  declarations: [PlanShipmentPopupComponent],
  imports: [CommonModule, CFDesignModule, SharedModule],
  exports: [PlanShipmentPopupComponent],
})
export class PlanShipmentPopupModule { }
