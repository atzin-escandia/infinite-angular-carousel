import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {InvestLandingPageComponent} from './invest-landing-page.page';

const routes: Routes = [{path: '', component: InvestLandingPageComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvestLandingPageRoutingModule { }
