import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {UpPageComponent} from './up.page';

const routes: Routes = [{path: '', component: UpPageComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UpRoutingModule { }
