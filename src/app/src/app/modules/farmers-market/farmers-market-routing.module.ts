import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ADOPTIONS, BOXES, SEARCH } from '@services/router/router.constants';
import { RouterStaticService } from '@services/router/router-static.service';

const routes: Routes = [
  {
    matcher: RouterStaticService.matcher(ADOPTIONS),
    loadChildren: () => import('./pages/adoptions/adoptions.module').then(m => m.AdoptionsModule)
  },
  {
    matcher: RouterStaticService.matcher(BOXES),
    loadChildren: () => import('./pages/boxes/boxes.module').then(m => m.BoxesModule)
  },
  {
    matcher: RouterStaticService.matcher(SEARCH),
    loadChildren: () => import('./pages/search-results/search-results.module').then(m => m.SearchResultsModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FarmersMarketRoutingModule {}
