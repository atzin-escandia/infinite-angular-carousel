import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@modules/shared/shared.module';
import { OpenIssueRoutingModule } from './open-issue-routing.module';
import { OpenIssuePageComponent } from './open-issue.page';
import { GenericPopupModule } from '@popups/generic-popup/generic-popup.module';
import { UserAccountComponentsModule } from '../../components/components.module';

@NgModule({
    declarations: [
        OpenIssuePageComponent
    ],
    imports: [
        CommonModule,
        OpenIssueRoutingModule,
        SharedModule,
        FormsModule,
        UserAccountComponentsModule,
        // Popups
        GenericPopupModule,
    ]
})
export class OpenIssueModule {}
