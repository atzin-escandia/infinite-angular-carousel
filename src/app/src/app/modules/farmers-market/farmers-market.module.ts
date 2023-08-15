import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@modules/shared/shared.module';
import { FarmersMarketComponent } from './farmers-market.component';
import { FarmersMarketRoutingModule } from './farmers-market-routing.module';
import { FarmersMarketService } from './farmers-market.service';
import { GiftInfoPopupModule } from '@popups/gift-info-popup/gift-info-popup.module';

@NgModule({
  declarations: [
    FarmersMarketComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FarmersMarketRoutingModule,
    GiftInfoPopupModule
  ],
  exports: [
    FarmersMarketComponent
  ],
  providers: [FarmersMarketService]
})
export class FarmersMarketModule { }
