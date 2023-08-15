import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@modules/shared/shared.module';
import { CtaBtnComponent } from './cta-btn.component';

@NgModule({
  declarations: [CtaBtnComponent],
  imports: [CommonModule, SharedModule],
  exports: [CtaBtnComponent],
})
export class CtaBtnModule {}
