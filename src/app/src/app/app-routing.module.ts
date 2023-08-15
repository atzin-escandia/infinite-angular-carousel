import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AutologinGuard } from './guards';
import { LangService, TextService, AuthService, TrackingService } from './services';
import { PermisionService } from '@services/permision';

const routes: Routes = [
  {
    path: 'auth/mkt-cloud/:codedInfo',
    loadChildren: () => import('./pages/blank/blank.module').then((m) => m.BlankModule),
    canActivate: [AutologinGuard],
  },
  {
    path: 'auth/:hash',
    loadChildren: () => import('./pages/blank/blank.module').then((m) => m.BlankModule),
    canActivate: [AutologinGuard],
  },
  {
    path: ':lang',
    children: [
      { path: 'home', pathMatch: 'full', redirectTo: '' },
      { path: 'fruits', pathMatch: 'full', redirectTo: 'food/fruits' },
      { path: 'login-register', redirectTo: 'login-register/login' },
      {
        path: '',
        loadChildren: () => import('./pages/home/home.module').then((m) => m.HomeModule),
      },
      {
        path: 'overharvest',
        loadChildren: () => import('./pages/home/home.module').then((m) => m.HomeModule),
      },
      {
        path: 'fruitimpact',
        loadChildren: () => import('./pages/fruit-impact/fruit-impact.module').then((m) => m.FruitImpactModule),
      },
      {
        path: 'green-page/:platform/:action/:token',
        loadChildren: () => import('./pages/green-page/green-page.module').then((m) => m.GreenPageModule),
      },
      {
        path: 'crowdfunding',
        loadChildren: () => import('./pages/invest-landing-page/invest-landing-page.module').then((m) => m.InvestLandingPageModule),
      },
      {
        path: 'food/:action',
        loadChildren: () => import('./pages/landing-page/landing-page.module').then((m) => m.LandingPageModule),
      },
      {
        path: 'product/:landingId',
        loadChildren: () => import('./pages/landing-builder/landing-builder.module').then((m) => m.LandingBuilderModule),
      },
      {
        path: 'draft/:landingId',
        loadChildren: () => import('./pages/landing-builder/landing-builder.module').then((m) => m.LandingBuilderModule),
      },
      {
        path: 'tos',
        loadChildren: () => import('./pages/tos/tos.module').then((m) => m.ToSModule),
      },
      {
        path: 'login-register/:action',
        loadChildren: () => import('./pages/login-register/login-register.module').then((m) => m.LoginRegisterModule),
      },
      {
        path: 'farmer/:farmerSlug',
        loadChildren: () => import('./pages/farmer/farmer.module').then((m) => m.FarmerModule),
      },
      {
        path: 'private-zone',
        loadChildren: () => import('./modules/user-account/user-account.module').then((m) => m.UserAccountCoreModule),
        canActivate: [AuthService],
      },
      {
        path: 'order',
        loadChildren: () => import('./modules/purchase/purchase.module').then((m) => m.PurchaseCoreModule),
      },
      {
        path: 'delivery-confirm/thanks/:orderId',
        loadChildren: () => import('./pages/delivery-confirm/thanks/thanks.module').then((m) => m.ThanksModule),
      },
      {
        path: 'delivery-confirm/apology/:orderId',
        loadChildren: () => import('./pages/delivery-confirm/apology/apology.module').then((m) => m.ApologyModule),
      },
      {
        path: 'events/not-available-gift',
        loadChildren: () =>
          import('./pages/gift-unavailable-landing/gift-unavailable-landing.module').then((m) => m.GiftUnavailableLandingModule),
      },
      {
        path: 'crowdgiving',
        loadChildren: () => import('./modules/crowdgiving/crowdgiving.module').then((m) => m.CrowdgivingPageModule),
      },
      {
        path: 'subscription-box',
        loadChildren: () => import('./pages/subscription-box/subscription-box-routing.module').then((m) => m.SubscriptionBoxRoutingModule),
      },

      // Empty url for redirect from child to several paths
      {
        path: '',
        loadChildren: () => import('./pages/download-app/download-app.module').then((m) => m.DownloadAppModule),
      },
      {
        path: '',
        loadChildren: () => import('./pages/landing-manifest/landing-manifest.module').then((m) => m.LandingManifestModule),
      },
      {
        path: '',
        loadChildren: () => import('./pages/contact-page/contact.module').then((m) => m.ContactPageModule),
      },
      {
        path: '',
        loadChildren: () => import('./modules/farmers-market/farmers-market.module').then((m) => m.FarmersMarketModule),
      },
      {
        path: '',
        loadChildren: () => import('./modules/e-commerce/e-commerce.module').then((m) => m.ECommerceModule),
      },
    ],
    canActivate: [LangService, TextService],
    canActivateChild: [TrackingService, PermisionService],
  },
  {
    path: '**',
    loadChildren: () => import('./pages/no-content/no-content.module').then((m) => m.NoContentModule),
    canActivate: [LangService],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled', initialNavigation: 'enabledBlocking' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
