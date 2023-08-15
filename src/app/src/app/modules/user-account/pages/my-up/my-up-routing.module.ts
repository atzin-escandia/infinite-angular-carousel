import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyUpPageComponent } from './my-up.page';

const routes: Routes = [{path: '', component: MyUpPageComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LifeRoutingModule { }
