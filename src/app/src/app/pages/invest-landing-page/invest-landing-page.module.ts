import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvestLandingPageRoutingModule } from './invest-landing-page-routing.module';
import { InvestLandingPageComponent } from './invest-landing-page.page';
import { SharedModule } from '@modules/shared/shared.module';
import { InvestInfoModule } from '@components/invest-landing-page/invest-info/invest-info.module';
import { GalleryCardModule } from '@components/invest-landing-page/gallery-card/gallery-card.module';

@NgModule({
  declarations: [InvestLandingPageComponent],
  imports: [CommonModule, InvestLandingPageRoutingModule, SharedModule, InvestInfoModule, GalleryCardModule],
})
export class InvestLandingPageModule {}
