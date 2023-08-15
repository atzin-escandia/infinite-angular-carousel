import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GoInvitationPageComponent } from './go-invitation.component';

const routes: Routes = [
  {
    path: '',
    component: GoInvitationPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GoInvitationRoutingModule {}
