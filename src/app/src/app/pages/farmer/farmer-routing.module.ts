import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

const routes: Routes = [
  {path: 'up/:upSlug', loadChildren: () => import('./up/up.module').then(m => m.UpModule), pathMatch: 'full'},
  {
    path: 'up/:upSlug/overharvest',
    loadChildren: () => import('./overharvest/overharvest.module').then(m => m.OverharvestModule),
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FarmerRoutingModule { }
