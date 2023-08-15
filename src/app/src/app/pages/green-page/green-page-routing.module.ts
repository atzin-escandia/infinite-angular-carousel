import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {GreenPageComponent} from './green-page.page';

const routes: Routes = [{path: '', component: GreenPageComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GreenPageRoutingModule { }
