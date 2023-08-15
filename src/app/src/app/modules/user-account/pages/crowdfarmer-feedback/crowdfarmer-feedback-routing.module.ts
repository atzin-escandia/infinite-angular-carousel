import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrowdfarmerFeedbackPageComponent } from './crowdfarmer-feedback.page';

const routes: Routes = [{path: '', component: CrowdfarmerFeedbackPageComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CrowdfarmerFeedbackRoutingModule { }
