import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrderInfoPageComponent } from './order-info.page';

const routes: Routes = [{path: '', component: OrderInfoPageComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrderInfoRoutingModule { }
