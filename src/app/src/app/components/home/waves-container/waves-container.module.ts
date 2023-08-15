import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { WavesContainerComponent } from '@components/home/waves-container/waves-container.component';
import { SharedModule } from '@modules/shared/shared.module';

@NgModule({
  declarations: [WavesContainerComponent],
  imports: [CommonModule, SharedModule],
  exports: [WavesContainerComponent],
})
export class WavesContainerModule {}
