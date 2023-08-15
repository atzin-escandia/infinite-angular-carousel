import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DownloadAppPageRoutingModule } from './download-app-routing.module';
import { DownloadAppPageComponent } from './download-app.page';
import { SharedModule } from '@modules/shared/shared.module';
import { LandingModule } from '@modules/landing/landing.module';
import { InstagramFeedComponent } from '@app/components';
import { VideoModule } from '@components/video/video.module';
import { NewsletterBlockModule } from '@components/home/newsletter-block/newsletter-block.module';
import { StoreButtonsModule } from '@components/store-buttons/store-buttons.module';

@NgModule({
  declarations: [DownloadAppPageComponent, InstagramFeedComponent],
  imports: [
    CommonModule,
    DownloadAppPageRoutingModule,
    SharedModule,
    StoreButtonsModule,
    LandingModule,
    NewsletterBlockModule,
    VideoModule,
  ],
})
export class DownloadAppModule {}
