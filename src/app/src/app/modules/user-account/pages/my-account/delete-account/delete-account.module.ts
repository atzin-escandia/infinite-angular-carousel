import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../shared/shared.module';
import { DeleteAccountRoutingModule } from './delete-account-routing.module';
import { DeleteAccountPageComponent } from './delete-account.page';
import { UserAccountComponentsModule } from '../../../components/components.module';
import { EmailSentPopupComponent } from '../../../popups/email-sent-popup';

@NgModule({
    declarations: [DeleteAccountPageComponent, EmailSentPopupComponent],
    imports: [CommonModule, DeleteAccountRoutingModule, SharedModule, UserAccountComponentsModule]
})
export class DeleteAccountModule {}
