import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {RouterStaticService} from '../../services/router/router-static.service';
import {CONTACT} from '../../services/router/router.constants';
import {ContactPageComponent} from './contact.page';

const routes: Routes = [{
  matcher: RouterStaticService.matcher(CONTACT),
  component: ContactPageComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContactPageRoutingModule { }
