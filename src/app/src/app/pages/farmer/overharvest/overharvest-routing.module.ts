import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {OverharvestPageComponent} from './overharvest.page';

const routes: Routes = [{path: '', component: OverharvestPageComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OverharvestRoutingModule { }
