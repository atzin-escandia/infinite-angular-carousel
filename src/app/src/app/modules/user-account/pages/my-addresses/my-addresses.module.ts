import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@modules/shared/shared.module';
import { MyAddressesRoutingModule } from './my-addresses-routing.module';
import { MyAddressesPageComponent } from './my-addresses.page';
import { ConfirmationPopupModule } from '@popups/confirmation-popup/confirmation-popup.module';
import { CountriesPopupModule } from '@popups/countries-selector/countries-selector.module';
import { StatusPopupModule } from '@popups/status-popup/status-popup.module';
import { UserAccountComponentsModule } from '../../components/components.module';
import { AddressPopupValidatorModule } from '@popups/address-validator/address-popup-validator.module';

@NgModule({
  declarations: [MyAddressesPageComponent],
  imports: [
    CommonModule,
    MyAddressesRoutingModule,
    SharedModule,
    FormsModule,
    UserAccountComponentsModule,
    // Popups
    ConfirmationPopupModule,
    CountriesPopupModule,
    StatusPopupModule,
    AddressPopupValidatorModule,
  ],
  exports: [AddressPopupValidatorModule],
})
export class MyAddressesModule {}
