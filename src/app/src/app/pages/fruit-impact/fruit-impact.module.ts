import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FruitImpactPageRoutingModule } from './fruit-impact-routing.module';
import { FruitImpactPageComponent } from './fruit-impact.page';
import { SharedModule } from '@modules/shared/shared.module';
import { LandingModule } from '@modules/landing/landing.module';
import { VideoModule } from '@components/video/video.module';
import { InstagramPostComponent } from '@app/components';

@NgModule({
  declarations: [
    FruitImpactPageComponent,
    InstagramPostComponent,
  ],
  imports: [
    CommonModule,
    FruitImpactPageRoutingModule,
    SharedModule,
    LandingModule,
    VideoModule
  ]
})
export class FruitImpactModule {}
