import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {SubscriptionInfoPageComponent} from './subscription-info.page';

const routes: Routes = [{path: '', component: SubscriptionInfoPageComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubscriptionInfoRoutingModule { }
