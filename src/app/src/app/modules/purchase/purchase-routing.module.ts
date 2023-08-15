import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthService } from '../../services';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'checkout',
    pathMatch: 'full',
  },
  {
    path: 'checkout',
    loadChildren: () => import('./pages/index').then((m) => m.CheckoutPageModule),
    pathMatch: 'full',
  },
  {
    path: 'order-ok',
    loadChildren: () => import('./pages/index').then((m) => m.OrderOkPageModule),
    pathMatch: 'full',
    canActivate: [AuthService],
  },
  {
    path: 'order-ok/:idPayment',
    loadChildren: () => import('./pages/index').then((m) => m.OrderOkPageModule),
    pathMatch: 'full',
    canActivate: [AuthService],
  },
  {
    path: 'go-order-ok/:hash',
    loadChildren: () => import('./pages/index').then((m) => m.OrderOkPageModule),
    pathMatch: 'full',
    canActivate: [AuthService],
  },
  {
    path: 'go-invitation/:hash',
    loadChildren: () => import('./pages/index').then((m) => m.GoInvitationModule),
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PurchaseCoreRoutingModule {}
