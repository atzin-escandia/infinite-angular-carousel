import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {LandingBuilderComponent} from './landing-builder.page';

const routes: Routes = [{path: '', component: LandingBuilderComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LandingBuilderRoutingModule { }
