import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@modules/shared/shared.module';
import { CountriesPrefixComponent } from './countries-prefix.component';

@NgModule({
  declarations: [CountriesPrefixComponent],
  imports: [CommonModule, SharedModule],
  exports: [CountriesPrefixComponent],
})
export class CountriesPrefixModule {}
