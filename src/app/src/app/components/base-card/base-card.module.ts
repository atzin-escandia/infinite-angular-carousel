import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseCardComponent } from './base-card.component';
import { EcImgEmptyComponent } from '@app/modules/e-commerce/components/ec-img-empty/ec-img-empty.component';

@NgModule({
  declarations: [BaseCardComponent],
  exports: [BaseCardComponent],
  imports: [CommonModule, EcImgEmptyComponent],
})
export class BaseCardModule {}
