import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {CountriesPopupComponent} from './countries-selector.component';
import {SharedModule} from '../../modules/shared/shared.module';

@NgModule({
  declarations: [CountriesPopupComponent],
  imports: [CommonModule, SharedModule],
  exports: [CountriesPopupComponent],
})
export class CountriesPopupModule { }
