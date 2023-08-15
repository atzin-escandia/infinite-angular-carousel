import { CommonModule } from '@angular/common';
import { CFDesignModule } from '@crowdfarming/cf-design';
import { NgModule } from '@angular/core';
import { CountrySelectorModule } from '@components/country-selector/country-selector.module';
import { VisitFromComponent } from './visit-from.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@modules/shared/shared.module';


@NgModule({
  declarations: [VisitFromComponent],
  imports: [CommonModule, CFDesignModule, CountrySelectorModule, BrowserModule, FormsModule, ReactiveFormsModule, SharedModule],
  exports: [VisitFromComponent],
})
export class VisitFormPopupModule {}
