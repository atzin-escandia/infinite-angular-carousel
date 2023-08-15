import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CFDesignModule } from '@crowdfarming/cf-design';
import { LiberateAdoptionInformativePopupComponent } from './liberate-adoption-informative-popup';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  declarations: [LiberateAdoptionInformativePopupComponent],
  imports: [CommonModule, CFDesignModule, SharedModule],
  exports: [LiberateAdoptionInformativePopupComponent],
})
export class LiberateAdoptionInformativePopupModule { }
