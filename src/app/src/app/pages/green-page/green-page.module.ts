import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GreenPageRoutingModule } from './green-page-routing.module';
import { GreenPageComponent } from './green-page.page';
import { GreenNewsletterComponent } from '@components/green-page/green-newsletter';
import { GreenCancelComponent } from '@components/green-page/green-cancel';
import { SharedModule } from '@modules/shared/shared.module';
import { StatusPopupModule } from '@popups/status-popup/status-popup.module';

@NgModule({
  declarations: [GreenPageComponent, GreenNewsletterComponent, GreenCancelComponent],
  imports: [
    CommonModule,
    GreenPageRoutingModule,
    SharedModule,
    // Popups
    StatusPopupModule,
  ],
})
export class GreenPageModule {}
