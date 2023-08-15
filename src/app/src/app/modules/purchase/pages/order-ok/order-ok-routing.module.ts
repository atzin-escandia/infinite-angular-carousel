import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderOkPageComponent } from './order-ok.page';

const routes: Routes = [
  {
    path: '',
    component: OrderOkPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderOkRoutingModule {}
