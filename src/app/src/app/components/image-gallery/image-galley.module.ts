import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@modules/shared/shared.module';
import { ImageGalleryComponent } from './image-gallery.component';

@NgModule({
  declarations: [ImageGalleryComponent],
  imports: [CommonModule, SharedModule],
  exports: [ImageGalleryComponent],
})
export class ImageGalleryModule {}
