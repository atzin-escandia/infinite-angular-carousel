import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FarmerRoutingModule } from './farmer-routing.module';
import { FarmerPageComponent } from './farmer.page';
import { SharedModule } from '../../modules/shared/shared.module';
import { AlcoholInformationComponent } from './components/alcohol-information/alcohol-information.component';
import { SubscriptionPopupModule } from '../../popups/subscription-popup/subscription-popup.module';
import { FarmerPageService } from './farmer.page.service';
import { HeaderSealsComponent } from './components/header-seals';

@NgModule({
  declarations: [FarmerPageComponent, AlcoholInformationComponent, HeaderSealsComponent],
  imports: [CommonModule, FarmerRoutingModule, SubscriptionPopupModule, SharedModule],
  exports: [AlcoholInformationComponent, HeaderSealsComponent],
  providers: [FarmerPageService]
})
export class FarmerModule { }
