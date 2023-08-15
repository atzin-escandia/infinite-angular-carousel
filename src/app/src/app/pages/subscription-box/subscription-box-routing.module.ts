import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubscriptionBoxUnavailablePageComponent } from './pages/unavailable/unavailable.page';
import { FruitsBoxLandingPageComponent } from './pages/boxes/fruits-box.page';
import { SubscriptionBoxCheckoutPageComponent } from './pages/checkout/checkout.page';
import { SubscriptionBoxSuccessPageComponent } from './pages/success/success.page';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'seasonal-organic-fruits', pathMatch: 'full' },
      {
        path: 'seasonal-organic-fruits',
        component: FruitsBoxLandingPageComponent,
      },
      {
        path: 'checkout',
        component: SubscriptionBoxCheckoutPageComponent,
      },
      {
        path: 'success',
        component: SubscriptionBoxSuccessPageComponent,
      },
      {
        path: 'unavailable',
        component: SubscriptionBoxUnavailablePageComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SubscriptionBoxRoutingModule {}
