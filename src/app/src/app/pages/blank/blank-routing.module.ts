import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {BlankPageComponent} from './blank.page';

const routes: Routes = [{path: '', component: BlankPageComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlankRoutingModule { }
