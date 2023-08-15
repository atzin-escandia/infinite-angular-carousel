import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@modules/shared/shared.module';
import { NotificationLanguageComponent } from './notification-language.component';

@NgModule({
  declarations: [NotificationLanguageComponent],
  imports: [CommonModule, SharedModule, FormsModule],
  exports: [NotificationLanguageComponent],
})
export class NotificationLanguageModule {}
