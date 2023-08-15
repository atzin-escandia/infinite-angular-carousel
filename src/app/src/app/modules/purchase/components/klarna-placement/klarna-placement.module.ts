import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KlarnaPlacementComponent } from './klarna-placement.component';

@NgModule({
  declarations: [KlarnaPlacementComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule],
  exports: [KlarnaPlacementComponent],
})
export class KlarnaPlacementModule {}
