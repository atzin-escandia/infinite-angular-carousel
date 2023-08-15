import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {CFDesignModule} from '@crowdfarming/cf-design';
import {SharedModule} from '../../modules/shared/shared.module';
import {AddressPopupValidatorComponent} from './address-popup-validator.component';

@NgModule({
  declarations: [AddressPopupValidatorComponent],
  imports: [CommonModule, SharedModule, CFDesignModule],
  exports: [AddressPopupValidatorComponent],
})
export class AddressPopupValidatorModule { }
