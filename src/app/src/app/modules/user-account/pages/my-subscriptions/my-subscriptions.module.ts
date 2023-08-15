import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@modules/shared/shared.module';
import { MySubscriptionsRoutingModule } from './my-subscriptions-routing.module';
import { MySubscriptionsPageComponent } from './my-subscriptions.page';

@NgModule({
  declarations: [MySubscriptionsPageComponent],
  imports: [CommonModule, MySubscriptionsRoutingModule, SharedModule],
})
export class MySubscriptionsModule {}
