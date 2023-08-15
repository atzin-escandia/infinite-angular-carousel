import {NgModule} from '@angular/core';
import {OrderAddressPopupComponent} from './order-address-popup';
import {SharedModule} from '@modules/shared/shared.module';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AddressModule} from '@components/address/address.module';
import {OptionCardModule} from '@components/option-card/option-card.module';
import {PasswordTosComponent} from '@app/components';

@NgModule({
  declarations: [
    OrderAddressPopupComponent,
    PasswordTosComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    AddressModule,
    OptionCardModule,
  ],
  exports: [
    OrderAddressPopupComponent,
    PasswordTosComponent
  ],
})
export class OrderAddressPopupModule { }
