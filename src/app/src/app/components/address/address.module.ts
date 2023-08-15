import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@modules/shared/shared.module';
import { CountriesPrefixModule } from '../countries-prefix/countries-prefix.module';
import { CountrySelectorModule } from '../country-selector/country-selector.module';
import { AddressComponent } from './address.component';

@NgModule({
  declarations: [AddressComponent],
  imports: [CommonModule, SharedModule, FormsModule, CountrySelectorModule, CountriesPrefixModule],
  exports: [AddressComponent],
})
export class AddressModule {}
