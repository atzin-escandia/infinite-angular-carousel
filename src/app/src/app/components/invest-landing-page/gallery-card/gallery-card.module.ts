import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@modules/shared/shared.module';
import { GalleryCardComponent } from './gallery-card.component';

@NgModule({
  declarations: [GalleryCardComponent],
  imports: [CommonModule, SharedModule],
  exports: [GalleryCardComponent],
})
export class GalleryCardModule {}
