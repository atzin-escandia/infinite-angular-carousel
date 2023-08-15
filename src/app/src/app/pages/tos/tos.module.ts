import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ToSRoutingModule} from './tos-routing.module';
import {ToSPageComponent} from './tos.page';
import {SharedModule} from '../../modules/shared/shared.module';

@NgModule({
  declarations: [ToSPageComponent],
  imports: [CommonModule, ToSRoutingModule, SharedModule]
})
export class ToSModule { }
