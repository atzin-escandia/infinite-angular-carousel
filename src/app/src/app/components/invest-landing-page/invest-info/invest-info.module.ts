import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@modules/shared/shared.module';
import { InvestInfoComponent } from './invest-info.component';

@NgModule({
  declarations: [InvestInfoComponent],
  imports: [CommonModule, SharedModule, FormsModule],
  exports: [InvestInfoComponent],
})
export class InvestInfoModule {}
