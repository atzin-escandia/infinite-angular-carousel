import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyAddressesPageComponent } from './my-addresses.page';

const routes: Routes = [{path: '', component: MyAddressesPageComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyAddressesRoutingModule { }
