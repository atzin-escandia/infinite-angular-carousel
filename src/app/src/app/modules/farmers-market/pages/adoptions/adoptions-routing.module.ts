import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdoptionsPageComponent } from './adoptions.page';

const routes: Routes = [
  {
    path: '',
    component: AdoptionsPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdoptionsRoutingModule { }
