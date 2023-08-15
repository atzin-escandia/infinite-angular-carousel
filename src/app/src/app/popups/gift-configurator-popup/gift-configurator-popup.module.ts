import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GiftConfiguratorPopupComponent} from './gift-configurator-popup.component';
import {CFDesignModule} from '@crowdfarming/cf-design';
import {TranslocoRootModule} from '../../transloco/transloco-root.module';
import {SharedModule} from '../../modules/shared/shared.module';
import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [GiftConfiguratorPopupComponent],
  imports: [CommonModule, CFDesignModule, TranslocoRootModule, SharedModule, FormsModule],
  exports: [GiftConfiguratorPopupComponent],
})
export class GiftConfiguratorPopupModule { }
