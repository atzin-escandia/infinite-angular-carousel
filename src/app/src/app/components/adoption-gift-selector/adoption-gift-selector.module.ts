import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@modules/shared/shared.module';
import { AdoptionGiftSelectorComponent } from './adoption-gift-selector.component';

@NgModule({
  declarations: [AdoptionGiftSelectorComponent],
  imports: [CommonModule, SharedModule],
  exports: [AdoptionGiftSelectorComponent],
})
export class AdoptionGiftSelectorModule {}
