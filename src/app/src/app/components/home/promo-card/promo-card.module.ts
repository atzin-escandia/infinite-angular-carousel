import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@modules/shared/shared.module';
import { PromoCardComponent } from './promo-card.component';

@NgModule({
  declarations: [PromoCardComponent],
  imports: [CommonModule, SharedModule],
  exports: [PromoCardComponent],
})
export class PromoCardModule {}
