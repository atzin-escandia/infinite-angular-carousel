import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@modules/shared/shared.module';
import { ShipmentComponentsModule } from './components/components.module';
import { ShipmentComponent } from './shipment.component';
import { ShipmentStoreService } from './store/store.service';

@NgModule({
  declarations: [ShipmentComponent],
  imports: [
    CommonModule,
    SharedModule,
    ShipmentComponentsModule
  ],
  exports: [ShipmentComponent],
  providers: [ShipmentStoreService]
})
export class ShipmentModule {}
