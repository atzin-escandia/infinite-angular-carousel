import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyFavouritesPageComponent } from './my-favourites.page';

const routes: Routes = [{path: '', component: MyFavouritesPageComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyFavouritesRoutingModule { }
