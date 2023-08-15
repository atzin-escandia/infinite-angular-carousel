import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { CFDesignModule } from '@crowdfarming/cf-design';

import { HomeRoutingModule } from './home-routing.module';
import { HomePageComponent } from './home.page';

import { FeedbackBlockComponent } from '@components/home/feedback-block/feedback-block.component';
import { GlobalHeaderComponent } from '@components/home/headers/global-header/global-header.component';
import { PromosBlockComponent } from '@components/home/promos-block/promos-block.component';
import { ProjectsBlockComponent } from '@components/home/projects-block/projects-block.component';
import { OptionsFilterComponent } from '@components/home/options-filter/options-filter.component';
import { WavesContainerModule } from '@app/components/home/waves-container/waves-container.module';
import { SelectCountryComponent } from '@components/home/select-country/select-country.component';
import { MarketCardsComponent } from '@components/home/market-cards/market-cards.component';
import { ProjectCardModule } from '@components/home/project-card/project-card.module';
import { PromoCardModule } from '@components/home/promo-card/promo-card.module';
import { ImageAndTextGalleryComponent } from '@components/home/image-and-text-gallery/image-and-text-gallery.component';
import { NewsletterBlockModule } from '@components/home/newsletter-block/newsletter-block.module';
import { FarmerMarketCardsComponent } from '@components/home/farmer-market-cards/farmer-market-cards.component';
import { CountersComponent } from '@components/home/counters/counters.component';
import { MediaLogosComponent } from '@components/home/media-logos/media-logos.component';
import { SalesModelComponent } from '@components/home/sales-model/sales-model.component';

import { BlogBlockModule } from '@components/blog-block/blog-block.module';
import { ProjectsAgroupmentsComponent } from '@components/projects-agroupments/projects-agroupments.component';
import { SharedModule } from '@modules/shared/shared.module';
import { LandingModule } from '@modules/landing/landing.module';
import { DownloadAppComponent } from '@app/components/home/download-app/download-app.component';
import { StoreButtonsModule } from '@components/store-buttons/store-buttons.module';
import { CarouselHeroComponent } from '@app/components/home/carrousel-hero/carousel-hero.component';
import { AcceleratorsComponent } from '@components/home/accelerators/accelerators.component';
import { BulletsComponent } from '@components/home/bullets/bullets.component';

@NgModule({
  declarations: [
    GlobalHeaderComponent,
    HomePageComponent,
    FeedbackBlockComponent,
    PromosBlockComponent,
    ProjectsBlockComponent,
    OptionsFilterComponent,
    SelectCountryComponent,
    MarketCardsComponent,
    CountersComponent,
    MediaLogosComponent,
    FarmerMarketCardsComponent,
    ImageAndTextGalleryComponent,
    SalesModelComponent,
    ProjectsAgroupmentsComponent,
    DownloadAppComponent,
    CarouselHeroComponent,
    AcceleratorsComponent,
    BulletsComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule,
    CFDesignModule,
    ProjectCardModule,
    PromoCardModule,
    BlogBlockModule,
    NewsletterBlockModule,
    LandingModule,
    StoreButtonsModule,
    WavesContainerModule,
  ],
  providers: [DecimalPipe],
})
export class HomeModule {}
