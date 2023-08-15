import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyGardenPageComponent } from './my-garden.page';

const routes: Routes = [{path: '', component: MyGardenPageComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyGardenRoutingModule { }
