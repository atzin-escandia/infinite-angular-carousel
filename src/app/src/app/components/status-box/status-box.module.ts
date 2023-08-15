import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {StatusBoxComponent} from '@app/components/status-box/status-box.component';

@NgModule({
  declarations: [StatusBoxComponent],
  imports: [CommonModule],
  exports: [StatusBoxComponent],
})
export class StatusBoxModule { }
