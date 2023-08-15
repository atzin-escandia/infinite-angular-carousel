import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CFDesignModule } from '@crowdfarming/cf-design';
import { ConfirmationPopupComponent } from './confirmation-popup';

@NgModule({
  declarations: [ConfirmationPopupComponent],
  imports: [CommonModule, CFDesignModule],
  exports: [ConfirmationPopupComponent],
})
export class ConfirmationPopupModule { }
