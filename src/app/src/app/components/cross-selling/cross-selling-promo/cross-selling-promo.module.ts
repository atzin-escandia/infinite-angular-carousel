import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@modules/shared/shared.module';
import { CrossSellingPromoComponent } from './cross-selling-promo.component';
import { FavouriteBtnModule } from '../../favourite-btn/favourite-btn.module';

@NgModule({
  declarations: [CrossSellingPromoComponent],
  imports: [CommonModule, SharedModule, FavouriteBtnModule],
  exports: [CrossSellingPromoComponent],
})
export class CrossSellingPromoModule {}
