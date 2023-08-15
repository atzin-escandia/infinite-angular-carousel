import {CommonModule} from '@angular/common';
import {CFDesignModule} from '@crowdfarming/cf-design';
import {NgModule} from '@angular/core';
import {CrosssellingNameComponent} from './crossselling-name';
import {SharedModule} from '../../modules/shared/shared.module';
import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [CrosssellingNameComponent],
  imports: [
    CommonModule,
    FormsModule,
    CFDesignModule,
    SharedModule
  ],
  exports: [CrosssellingNameComponent],
})
export class CrosssellingNameModule { }
