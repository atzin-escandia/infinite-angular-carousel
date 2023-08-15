import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@modules/shared/shared.module';
import { CrowdfarmerFeedbackRoutingModule } from './crowdfarmer-feedback-routing.module';
import { CrowdfarmerFeedbackPageComponent } from './crowdfarmer-feedback.page';
import { GenericPopupModule } from '@popups/generic-popup/generic-popup.module';
import { UserAccountComponentsModule } from '../../components/components.module';

@NgModule({
    declarations: [
        CrowdfarmerFeedbackPageComponent
    ],
    imports: [
        CommonModule,
        CrowdfarmerFeedbackRoutingModule,
        SharedModule,
        FormsModule,
        UserAccountComponentsModule,
        // Popups
        GenericPopupModule,
    ]
})
export class CrowdfarmerFeedbackModule {}
