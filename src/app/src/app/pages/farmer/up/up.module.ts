import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UpRoutingModule } from './up-routing.module';
import { UpPageComponent } from './up.page';
import { FarmerModule } from '../farmer.module';
import { SharedModule } from '../../../modules/shared/shared.module';
import { SealPopupComponent } from '../../../popups/seal/seal-popup';
import { CostsCalculatorPopupComponent } from './popups/costs-calculator-popup';
import { CountriesPopupModule } from '../../../popups/countries-selector/countries-selector.module';

import {
  UpCardComponent,
  UpHistoryComponent,
  UpInformationComponent,
  UpHeaderComponent,
  UpHeaderMessagesComponent,
  UpWhatInformationComponent,
  UpWhenInformationComponent,
} from './components';
import { FormsModule } from '@angular/forms';
import { CountrySelectorModule } from '@components/country-selector/country-selector.module';
import { ImageGalleryModule } from '@components/image-gallery/image-galley.module';
import { CalendarDeliveryInfoComponent } from '@components/calendar-delivery-info';
import { SealElementModule } from '@components/seal-component/seal-element.module';
import { VideoModule } from '@components/video/video.module';
import { UpPageService } from './up.page.service';
import { AdoptionGiftSelectorModule } from '@components/adoption-gift-selector/adoption-gift-selector.module';
import { FavouriteBtnModule } from '@app/components/favourite-btn/favourite-btn.module';

@NgModule({
  declarations: [
    UpPageComponent,
    UpCardComponent,
    UpHistoryComponent,
    UpInformationComponent,
    UpWhatInformationComponent,
    UpWhenInformationComponent,
    UpHeaderComponent,
    UpHeaderMessagesComponent,
    CalendarDeliveryInfoComponent,
    SealPopupComponent,
    CostsCalculatorPopupComponent,
  ],
  imports: [
    CommonModule,
    UpRoutingModule,
    FormsModule,
    VideoModule,
    SharedModule,
    SealElementModule,
    CountrySelectorModule,
    ImageGalleryModule,
    FavouriteBtnModule,
    FarmerModule,
    // Popups
    CountriesPopupModule,
    AdoptionGiftSelectorModule,
  ],
  providers: [UpPageService],
})
export class UpModule {}
