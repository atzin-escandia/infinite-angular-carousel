import { CommonModule } from '@angular/common';
import { CFDesignModule } from '@crowdfarming/cf-design';
import { NgModule } from '@angular/core';
import { SoftRegisterPopupComponent } from './soft-register.component';
import { CountrySelectorModule } from '@components/country-selector/country-selector.module';


@NgModule({
  declarations: [SoftRegisterPopupComponent],
  imports: [CommonModule, CFDesignModule, CountrySelectorModule],
  exports: [SoftRegisterPopupComponent],
})
export class SoftRegisterPopupModule {}
