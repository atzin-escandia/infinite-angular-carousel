import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {ToSPageComponent} from './tos.page';

const routes: Routes = [{path: '', component: ToSPageComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ToSRoutingModule { }
