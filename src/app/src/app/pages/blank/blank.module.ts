import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {BlankRoutingModule} from './blank-routing.module';
import {BlankPageComponent} from './blank.page';

@NgModule({
  declarations: [BlankPageComponent],
  imports: [CommonModule, BlankRoutingModule]
})
export class BlankModule { }
