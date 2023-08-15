import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { E_COMMERCE_ROUTES } from './constant/routes.constant';
import { ECommerceComponent } from './e-commerce.page';
import { CatalogComponent } from './pages/catalog/catalog.page';
import { DetailPageComponent } from './pages/detail/detail.page';
import { UnavailableComponent } from './pages/unavailable/unavailable.page';

const rou: Routes = [];

Object.values(E_COMMERCE_ROUTES.MULTI_LANG_ROUTES).map(route => [
  rou.push({
    path: route,
    component: ECommerceComponent,
    children: [
      {
        path: ':detail',
        pathMatch: 'full',
        component: DetailPageComponent,
        data: { isDetail: true },
      },
      {
        path: '',
        component: CatalogComponent,
      }
    ],
  }),
]);

rou.push({
  path: E_COMMERCE_ROUTES.UNAVAILABLE,
  component: UnavailableComponent,
});

rou.push({
  path: E_COMMERCE_ROUTES.ERROR,
  component: UnavailableComponent,
});

@NgModule({
  imports: [RouterModule.forChild(rou)],
  exports: [RouterModule],
})
export class ECommerceRoutingModule { }
