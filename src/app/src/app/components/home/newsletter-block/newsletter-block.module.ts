import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@modules/shared/shared.module';
import { NewsletterBlockComponent } from './newsletter-block.component';

@NgModule({
  declarations: [NewsletterBlockComponent],
  imports: [CommonModule, SharedModule],
  exports: [NewsletterBlockComponent],
})
export class NewsletterBlockModule {}
