import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ThanksPageComponent } from './thanks.page';

const routes: Routes = [
  { path: '', component: ThanksPageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ThanksRoutingModule { }
