import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@modules/shared/shared.module';
import { OptionCardComponent } from './option-card.component';

@NgModule({
  declarations: [OptionCardComponent],
  imports: [CommonModule, SharedModule],
  exports: [OptionCardComponent],
})
export class OptionCardModule {}
