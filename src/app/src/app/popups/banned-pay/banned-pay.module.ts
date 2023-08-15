import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import { BannedPayComponent } from '.';
import {SharedModule} from '../../modules/shared/shared.module';

@NgModule({
  declarations: [BannedPayComponent],
  imports: [CommonModule, SharedModule],
  exports: [BannedPayComponent],
})
export class BannedPayModule { }
