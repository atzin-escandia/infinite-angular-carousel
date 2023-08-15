import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@modules/shared/shared.module';
import { SealElementComponent } from './seal-element.component';

@NgModule({
  declarations: [SealElementComponent],
  imports: [CommonModule, SharedModule],
  exports: [SealElementComponent],
})
export class SealElementModule {}
