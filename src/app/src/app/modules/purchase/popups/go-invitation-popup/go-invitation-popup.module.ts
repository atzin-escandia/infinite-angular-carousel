import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GOInvitationPopupComponent } from './go-invitation-popup.component';
import { SharedModule } from '@modules/shared/shared.module';
import { PurchaseComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [GOInvitationPopupComponent],
  imports: [CommonModule, FormsModule, SharedModule, PurchaseComponentsModule],
  exports: [GOInvitationPopupComponent],
})
export class GOInvitationPopupModule {}
