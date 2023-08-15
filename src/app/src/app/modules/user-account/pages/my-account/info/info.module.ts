import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../../shared/shared.module';
import { InfoRoutingModule } from './info-routing.module';
import { InfoPageComponent } from './info.page';
import { ChangePasswordPopupComponent } from '../../../popups/change-password';
import { ConfirmationPopupModule } from '@popups/confirmation-popup/confirmation-popup.module';
import { CountriesPopupModule } from '@popups/countries-selector/countries-selector.module';
import { StatusPopupModule } from '@popups/status-popup/status-popup.module';
import { UserAccountComponentsModule } from '../../../components/components.module';

@NgModule({
    declarations: [
        InfoPageComponent,
        // Popups
        ChangePasswordPopupComponent
    ],
    imports: [
        CommonModule,
        InfoRoutingModule,
        SharedModule,
        FormsModule,
        UserAccountComponentsModule,
        // Popups
        ConfirmationPopupModule,
        CountriesPopupModule,
        StatusPopupModule,
    ]
})
export class InfoModule {}
