import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {GoShareBoxesPopupComponent} from './go-share-boxes-popup.component';
import {CFDesignModule} from '@crowdfarming/cf-design';
import {TranslocoRootModule} from '../../transloco/transloco-root.module';

@NgModule({
  declarations: [GoShareBoxesPopupComponent],
  imports: [CommonModule, CFDesignModule, TranslocoRootModule],
  exports: [GoShareBoxesPopupComponent],
})
export class GoShareBoxesPopupModule { }
