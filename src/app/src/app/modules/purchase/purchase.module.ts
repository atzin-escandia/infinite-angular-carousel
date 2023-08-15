import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PurchaseCoreComponent } from './purchase.component';
import { PurchaseCoreRoutingModule } from './purchase-routing.module';

@NgModule({
  declarations: [PurchaseCoreComponent],
  imports: [CommonModule, PurchaseCoreRoutingModule],
  exports: [PurchaseCoreComponent],
})
export class PurchaseCoreModule {}
