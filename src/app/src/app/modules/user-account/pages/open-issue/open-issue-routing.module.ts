import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OpenIssuePageComponent } from './open-issue.page';

const routes: Routes = [{path: '', component: OpenIssuePageComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OpenIssueRoutingModule { }
