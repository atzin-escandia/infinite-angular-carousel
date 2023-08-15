import {CommonModule} from '@angular/common';
import {CFDesignModule} from '@crowdfarming/cf-design';
import {NgModule} from '@angular/core';
import {StatusPopupComponent} from './status-popup';
import {TranslocoRootModule} from '../../transloco//transloco-root.module';

@NgModule({
  declarations: [StatusPopupComponent],
  imports: [CommonModule, CFDesignModule, TranslocoRootModule],
  exports: [StatusPopupComponent],
})
export class StatusPopupModule { }
