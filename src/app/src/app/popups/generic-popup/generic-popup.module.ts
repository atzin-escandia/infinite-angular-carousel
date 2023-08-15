import {CommonModule} from '@angular/common';
import {CFDesignModule} from '@crowdfarming/cf-design';
import {NgModule} from '@angular/core';
import {GenericPopupComponent} from './generic-popup';

@NgModule({
  declarations: [GenericPopupComponent],
  imports: [CommonModule, CFDesignModule],
  exports: [GenericPopupComponent],
})
export class GenericPopupModule { }
