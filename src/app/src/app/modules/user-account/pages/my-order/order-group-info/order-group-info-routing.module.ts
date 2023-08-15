import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {OrderGroupInfoPageComponent} from './order-group-info.page';

const routes: Routes = [{path: '', component: OrderGroupInfoPageComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrderGroupInfoRoutingModule { }
