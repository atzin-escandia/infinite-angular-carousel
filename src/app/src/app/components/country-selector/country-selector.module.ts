import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@modules/shared/shared.module';
import { CountrySelectorComponent } from './country-selector.component';

@NgModule({
  declarations: [CountrySelectorComponent],
  imports: [CommonModule, SharedModule],
  exports: [CountrySelectorComponent],
})
export class CountrySelectorModule {}
