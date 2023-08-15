import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {RouterStaticService} from '../../services/router/router-static.service';
import {MANIFESTO} from '../../services/router/router.constants';
import {LandingManifestComponent} from './landing-manifest.page';

const routes: Routes = [{
  matcher: RouterStaticService.matcher(MANIFESTO),
  component: LandingManifestComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LandingManifestRoutingModule { }
