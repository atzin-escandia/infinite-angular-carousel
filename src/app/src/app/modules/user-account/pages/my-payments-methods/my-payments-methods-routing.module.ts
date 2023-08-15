import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyPaymentsMethodsPageComponent } from './my-payments-methods.page';

const routes: Routes = [{path: '', component: MyPaymentsMethodsPageComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyPaymentsMethodsRoutingModule { }
