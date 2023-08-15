import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@modules/shared/shared.module';
import { LandingFaqComponent } from './components/landing-faq/landing-faq.component';
import { LandingPromoComponent } from './components/landing-promo/landing-promo.component';
import { LandingTextImageComponent } from './components/landing-text-image/landing-text-image.component';
import { LandingStepsBlockComponent } from './components/landing-steps-block/landing-steps-block.component';
import { LandingTitleComponent } from './components/landing-title/landing-title.component';
import { LandingVideoPlayerComponent } from './components/landing-video-player/landing-video-player.component';
import { LandingAgroupmentComponent } from './components/landing-agroupment/landing-agroupment.component';
import { VideoModule } from '@components/video/video.module';
import { AgroupmentModule } from '@components/agroupment/agroupment.module';
import { TableGridModule } from '@components/table-grid/table-grid.module';
import { CtaBtnModule } from '@components/cta-btn/cta-btn.module';

@NgModule({
  declarations: [
    LandingFaqComponent,
    LandingPromoComponent,
    LandingTextImageComponent,
    LandingStepsBlockComponent,
    LandingTitleComponent,
    LandingVideoPlayerComponent,
    LandingAgroupmentComponent,
  ],
  imports: [CommonModule, SharedModule, VideoModule, AgroupmentModule, TableGridModule, CtaBtnModule],
  exports: [
    LandingFaqComponent,
    LandingPromoComponent,
    LandingTextImageComponent,
    LandingStepsBlockComponent,
    LandingTitleComponent,
    LandingVideoPlayerComponent,
    LandingAgroupmentComponent,
  ],
})
export class LandingModule {}
