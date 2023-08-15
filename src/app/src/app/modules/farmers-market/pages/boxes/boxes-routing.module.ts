import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BoxesPageComponent } from './boxes.page';

const routes: Routes = [
  {
    path: '',
    component: BoxesPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BoxesRoutingModule { }
