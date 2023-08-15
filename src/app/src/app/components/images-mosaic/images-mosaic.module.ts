import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImagesMosaicComponent } from './images-mosaic.component';
import { SharedModule } from '@app/modules/shared/shared.module';
import { EcImgEmptyComponent } from '@app/modules/e-commerce/components/ec-img-empty/ec-img-empty.component';

@NgModule({
  declarations: [ImagesMosaicComponent],
  exports: [ImagesMosaicComponent],
  imports: [CommonModule, SharedModule, EcImgEmptyComponent],
})
export class ImagesMosaicModule {}
