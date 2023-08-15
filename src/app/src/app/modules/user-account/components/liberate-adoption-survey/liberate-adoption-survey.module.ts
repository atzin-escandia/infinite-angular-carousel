import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LiberateAdoptionSurveyComponent } from './liberate-adoption-survey.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { CFDesignModule } from '@crowdfarming/cf-design';


@NgModule({
  declarations: [
    LiberateAdoptionSurveyComponent,
  ],
  exports: [
    LiberateAdoptionSurveyComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    CFDesignModule
  ]
})
export class LiberateAdoptionSurveyModule { }
