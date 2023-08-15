import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserAccountPageComponent } from './user-account.page';

const routes: Routes = [
  {
    path: '',
    component: UserAccountPageComponent,
    children: [
      { path: '', redirectTo: 'my-garden', pathMatch: 'full' },
      { path: 'my-up', redirectTo: 'my-garden', pathMatch: 'full' },
      { path: 'my-garden', loadChildren: () => import('./pages/my-garden/my-garden.module').then((m) => m.MyGardenModule) },
      {
        path: 'my-addresses',
        loadChildren: () => import('./pages/my-addresses/my-addresses.module').then((m) => m.MyAddressesModule),
        pathMatch: 'full',
      },
      {
        path: 'my-payments-methods',
        loadChildren: () => import('./pages/my-payments-methods/my-payments-methods.module').then((m) => m.MyPaymentsMethodsModule),
        pathMatch: 'full',
      },
      {
        path: 'my-favourites',
        loadChildren: () => import('./pages/my-favourites/my-favourites.module').then((m) => m.MyFavouritesModule),
        pathMatch: 'full',
      },
      {
        path: 'my-subscriptions',
        loadChildren: () => import('./pages/my-subscriptions/my-subscriptions.module').then((m) => m.MySubscriptionsModule),
        pathMatch: 'full',
      },

      // My order
      { path: 'my-order', redirectTo: 'my-order/list', pathMatch: 'full' },
      {
        path: 'my-order/list',
        loadChildren: () => import('./pages/my-order/list/list.module').then((m) => m.ListModule),
        pathMatch: 'full',
      },
      {
        path: 'my-order/info/:orderId',
        loadChildren: () => import('./pages/my-order/order-info/order-info.module').then((m) => m.OrderInfoModule),
        pathMatch: 'full',
      },
      {
        path: 'my-order/:orderId/feedback',
        loadChildren: () => import('./pages/crowdfarmer-feedback/crowdfarmer-feedback.module').then((m) => m.CrowdfarmerFeedbackModule),
        pathMatch: 'full',
      },
      {
        path: 'my-order/group-info/:orderId',
        loadChildren: () => import('./pages/my-order/order-group-info/order-group-info.module').then((m) => m.OrderGroupInfoModule),
        pathMatch: 'full',
      },
      {
        path: 'my-order/subscription-info/:subscriptionId',
        loadChildren: () => import('./pages/my-order/subscription-info/subscription-info.module').then((m) => m.SubscriptionInfoModule),
        pathMatch: 'full',
      },
      // My up
      { path: 'my-up/:upCfId', loadChildren: () => import('./pages/my-up/my-up.module').then((m) => m.LifeModule), pathMatch: 'full' },
      {
        path: 'my-up/:upCfId/harvest',
        loadChildren: () => import('./pages/my-up/my-up.module').then((m) => m.LifeModule),
        pathMatch: 'full',
      },
      { path: 'my-up/:upCfId/life', redirectTo: 'my-up/:upCfId/harvest', pathMatch: 'full' },

      // My account
      { path: 'my-account', redirectTo: 'my-account/info', pathMatch: 'full' },
      {
        path: 'my-account/info',
        loadChildren: () => import('./pages/my-account/info/info.module').then((m) => m.InfoModule),
        pathMatch: 'full',
      },
      {
        path: 'my-account/info/delete-account',
        loadChildren: () => import('./pages/my-account/delete-account/delete-account.module').then((m) => m.DeleteAccountModule),
        pathMatch: 'full',
      },
      {
        path: 'my-account/info/:ignore',
        loadChildren: () => import('./pages/my-account/info/info.module').then((m) => m.InfoModule),
        pathMatch: 'full',
      },

      // Open issue
      {
        path: 'open-issue/:orderId',
        loadChildren: () => import('./pages/open-issue/open-issue.module').then((m) => m.OpenIssueModule),
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserAccountRoutingModule {}
