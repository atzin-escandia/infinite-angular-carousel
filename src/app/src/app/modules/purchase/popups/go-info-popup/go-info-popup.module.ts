import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CFDesignModule } from '@crowdfarming/cf-design';
import { GOInfoPopupComponent } from './go-info-popup.component';
import { SharedModule } from '../../../../modules/shared/shared.module';

@NgModule({
  declarations: [GOInfoPopupComponent],
  imports: [CommonModule, SharedModule, CFDesignModule],
  exports: [GOInfoPopupComponent],
})
export class GOInfoPopupModule {}
