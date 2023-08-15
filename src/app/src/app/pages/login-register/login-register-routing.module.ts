import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {LoginRegisterPageComponent} from './';

const routes: Routes = [{path: '', component: LoginRegisterPageComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRegisterRoutingModule { }
