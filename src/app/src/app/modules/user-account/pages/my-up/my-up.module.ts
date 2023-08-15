import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LifeRoutingModule } from './my-up-routing.module';
import { MyUpPageComponent } from './my-up.page';
import { SharedModule } from '@modules/shared/shared.module';
import { EditCertificateComponent } from '../../components/edit-certificate/edit-certificate.component';
import { UserAccountComponentsModule } from '../../components/components.module';
import { OrderAddressPopupModule } from '@popups/order-address-popup/order-address-popup.module';
import { ConfirmationPopupModule } from '@popups/confirmation-popup/confirmation-popup.module';
import { CountriesPopupModule } from '@popups/countries-selector/countries-selector.module';
import { GenericPopupModule } from '@popups/generic-popup/generic-popup.module';
import { StatusPopupModule } from '@popups/status-popup/status-popup.module';
import { ColouredPopupModule } from '../../popups/coloured-popup/coloured-popup.module';
import { PhotoVisorComponent } from '../../popups/photo-visor';
import { PlanShipmentPopupModule } from '../../popups/plan-shipment/plan-shipment.module';
import {
  LiberateAdoptionConfirmationPopupModule
} from '../../popups/liberate-adoption-confirmation-popup/liberate-adoption-confirmation-popup.module';
import {
  LiberateAdoptionInformativePopupModule
} from '../../popups/liberate-adoption-informative-popup/liberate-adoption-informative-popup.module';
import {
  LiberateAdoptionSurveyModule
} from '@modules/user-account/components/liberate-adoption-survey/liberate-adoption-survey.module';

@NgModule({
  declarations: [
    MyUpPageComponent,
    // Popups
    PhotoVisorComponent,
    EditCertificateComponent,
  ],
  imports: [
    CommonModule,
    LifeRoutingModule,
    UserAccountComponentsModule,
    SharedModule,
    // Popups
    ColouredPopupModule,
    OrderAddressPopupModule,
    ConfirmationPopupModule,
    CountriesPopupModule,
    GenericPopupModule,
    StatusPopupModule,
    PlanShipmentPopupModule,
    LiberateAdoptionConfirmationPopupModule,
    LiberateAdoptionInformativePopupModule,
    LiberateAdoptionSurveyModule,
  ],
})
export class LifeModule {}
