import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@modules/shared/shared.module';
import { CrossSellingPromoModule } from '../cross-selling-promo/cross-selling-promo.module';
import { CrossSellingBlockComponent } from './cross-selling-block.component';

@NgModule({
  declarations: [CrossSellingBlockComponent],
  imports: [CommonModule, SharedModule, CrossSellingPromoModule],
  exports: [CrossSellingBlockComponent],
})
export class CrossSellingBlockModule {}
