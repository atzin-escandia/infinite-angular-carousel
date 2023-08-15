import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeleteAccountPageComponent } from './delete-account.page';

const routes: Routes = [{ path: '', component: DeleteAccountPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeleteAccountRoutingModule {}
