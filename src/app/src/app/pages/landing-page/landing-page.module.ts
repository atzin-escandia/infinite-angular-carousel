import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingPageRoutingModule } from './landing-page-routing.module';
import { LandingPageComponent } from './landing-page.page';
import { SharedModule } from '@modules/shared/shared.module';
import { LandingModule } from '@modules/landing/landing.module';
import { VideoModule } from '@components/video/video.module';

@NgModule({
  declarations: [LandingPageComponent],
  imports: [CommonModule, LandingPageRoutingModule, SharedModule, VideoModule, LandingModule],
})
export class LandingPageModule {}
