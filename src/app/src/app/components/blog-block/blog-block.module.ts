import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@modules/shared/shared.module';
import { BlogBlockComponent } from './blog-block.component';

@NgModule({
  declarations: [BlogBlockComponent],
  imports: [CommonModule, SharedModule],
  exports: [BlogBlockComponent],
})
export class BlogBlockModule {}
