import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {FruitImpactPageComponent} from './fruit-impact.page';

const routes: Routes = [{path: '', component: FruitImpactPageComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FruitImpactPageRoutingModule { }
