import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {DownloadAppPageComponent} from './download-app.page';
import {RouterStaticService} from '../../services/router/router-static.service';
import {DOWNLOAD_APP_LANGING} from '../../services/router/router.constants';

const routes: Routes = [
  {
    matcher: RouterStaticService.matcher(DOWNLOAD_APP_LANGING),
    component: DownloadAppPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DownloadAppPageRoutingModule { }
