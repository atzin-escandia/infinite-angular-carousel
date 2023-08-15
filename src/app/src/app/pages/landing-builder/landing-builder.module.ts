import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingBuilderRoutingModule } from './landing-builder-routing.module';
import { LandingBuilderComponent } from './landing-builder.page';
import { SharedModule } from '@modules/shared/shared.module';
import { LandingModule } from '@modules/landing/landing.module';
import { VideoModule } from '@components/video/video.module';
import { NoContentModule } from '@pages/no-content/no-content.module';


@NgModule({
  declarations: [
    LandingBuilderComponent,
  ],
  imports: [
    CommonModule,
    LandingBuilderRoutingModule,
    SharedModule,
    NoContentModule,
    VideoModule,
    LandingModule
  ]
})
export class LandingBuilderModule {}
