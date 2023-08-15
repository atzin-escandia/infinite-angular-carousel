import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CFDesignModule } from '@crowdfarming/cf-design';
import { LiberateAdoptionConfirmationPopupComponent } from './liberate-adoption-confirmation-popup';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  declarations: [LiberateAdoptionConfirmationPopupComponent],
  imports: [CommonModule, CFDesignModule, SharedModule],
  exports: [LiberateAdoptionConfirmationPopupComponent],
})
export class LiberateAdoptionConfirmationPopupModule { }
