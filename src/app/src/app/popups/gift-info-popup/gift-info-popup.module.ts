import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GiftInfoPopupComponent} from './gift-info-popup.component';
import {CFDesignModule} from '@crowdfarming/cf-design';
import {TranslocoRootModule} from '../../transloco/transloco-root.module';

@NgModule({
  declarations: [GiftInfoPopupComponent],
  imports: [CommonModule, CFDesignModule, TranslocoRootModule],
  exports: [GiftInfoPopupComponent],
})
export class GiftInfoPopupModule { }
