import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ThanksRoutingModule } from './thanks-routing.module';
import { ThanksPageComponent } from './thanks.page';
import { SharedModule } from '../../../modules/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { CrossSellingBlockModule } from '@components/cross-selling/cross-selling-block/cross-selling-block.module';
import { CrossSellingPromoModule } from '@components/cross-selling/cross-selling-promo/cross-selling-promo.module';
import { ProjectCardModule } from '@components/home/project-card/project-card.module';

@NgModule({
  declarations: [ThanksPageComponent],
  imports: [
    CommonModule,
    FormsModule,
    CrossSellingPromoModule,
    ThanksRoutingModule,
    SharedModule,
    CrossSellingPromoModule,
    CrossSellingBlockModule,
    ProjectCardModule,
  ],
  exports: [CrossSellingBlockModule, CrossSellingPromoModule],
})
export class ThanksModule {}
