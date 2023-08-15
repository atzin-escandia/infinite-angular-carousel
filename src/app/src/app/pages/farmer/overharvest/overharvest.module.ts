import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverharvestRoutingModule } from './overharvest-routing.module';
import { OverharvestPageComponent } from './overharvest.page';
import { FarmerModule } from '../farmer.module';
import { SharedModule } from '@modules/shared/shared.module';
import { OhHeaderComponent, OhInfoComponent } from './components';
import { ImageGalleryModule } from '@components/image-gallery/image-galley.module';
import { CountryRowComponent, CrossSellingBlockModule, CrossSellingPromoModule } from '@app/components';
import { TechnicalInfoComponent } from './components/technical-info';
import { SealElementModule } from '@components/seal-component/seal-element.module';
import { VideoModule } from '@components/video/video.module';
import { FavouriteBtnModule } from '@app/components/favourite-btn/favourite-btn.module';

@NgModule({
  declarations: [OverharvestPageComponent, OhHeaderComponent, OhInfoComponent, CountryRowComponent, TechnicalInfoComponent],
  imports: [
    CommonModule,
    CrossSellingBlockModule,
    CrossSellingPromoModule,
    SealElementModule,
    OverharvestRoutingModule,
    SharedModule,
    VideoModule,
    ImageGalleryModule,
    FarmerModule,
    FavouriteBtnModule
  ],
  exports: [CrossSellingBlockModule, CrossSellingPromoModule],
})
export class OverharvestModule {}
