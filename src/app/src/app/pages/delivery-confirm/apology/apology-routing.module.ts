import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApologyPageComponent } from './apology.page';

const routes: Routes = [
  { path: '', component: ApologyPageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApologyRoutingModule { }
