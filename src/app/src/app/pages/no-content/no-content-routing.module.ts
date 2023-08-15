import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {NoContentPageComponent} from './no-content.page';

const routes: Routes = [{path: '', component: NoContentPageComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NoContentRoutingModule { }
