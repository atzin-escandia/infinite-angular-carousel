import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@modules/shared/shared.module';
import { AtomicModule } from '../../../components/_atomic/atomic.module';
import * as COMPONENTS from './index';

const _COMPONENNTS = [
  COMPONENTS.AddressFormComponent,
  COMPONENTS.CountriesDropdownComponent,
  COMPONENTS.FullListToggleComponent,
  COMPONENTS.UserAddressCardComponent,
];

@NgModule({
  declarations: [..._COMPONENNTS],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    AtomicModule,
  ],
  exports: [..._COMPONENNTS],
})
export class ShipmentComponentsModule {}
