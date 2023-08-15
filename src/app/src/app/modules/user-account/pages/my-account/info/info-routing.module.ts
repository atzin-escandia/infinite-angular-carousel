import { NgModule} from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InfoPageComponent } from './info.page';

const routes: Routes = [{path: '', component: InfoPageComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InfoRoutingModule { }
