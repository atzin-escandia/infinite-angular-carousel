import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {GiftUnavailableLandingRoutingModule} from './gift-unavaliable-landing-routing.module';
import {SharedModule} from '../../modules/shared/shared.module';
import {GiftUnavailableLandingPageComponent} from './gift-unavailable-landing.page';

@NgModule({
  declarations: [
    GiftUnavailableLandingPageComponent
  ],
  imports: [
    CommonModule,
    GiftUnavailableLandingRoutingModule,
    SharedModule
  ]
})
export class GiftUnavailableLandingModule { }
