import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoInvitationPageComponent } from './go-invitation.component';
import { GoInvitationRoutingModule } from './go-invitation-routing.module';
import { PurchaseComponentsModule } from '../../components/components.module';
import { SharedModule } from '@modules/shared/shared.module';
import { PurchaseServicesModule } from '../../services/purchase.module';
import { CrossSellingBlockModule } from '@app/components';
import { ProjectCardModule } from '@app/components/home/project-card/project-card.module';

@NgModule({
  declarations: [GoInvitationPageComponent],
  imports: [
    CommonModule,
    GoInvitationRoutingModule,
    PurchaseComponentsModule,
    SharedModule,
    PurchaseServicesModule,
    CrossSellingBlockModule,
    ProjectCardModule,
  ],
})
export class GoInvitationModule {}
