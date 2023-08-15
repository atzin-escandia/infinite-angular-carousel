import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MySubscriptionsPageComponent } from './my-subscriptions.page';

const routes: Routes = [{ path: '', component: MySubscriptionsPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MySubscriptionsRoutingModule {}
