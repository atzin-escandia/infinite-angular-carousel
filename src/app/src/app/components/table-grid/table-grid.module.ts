import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@modules/shared/shared.module';
import {TableGridComponent} from './table-grid.component';

@NgModule({
  declarations: [TableGridComponent],
  imports: [CommonModule, SharedModule],
  exports: [TableGridComponent],
})
export class TableGridModule {}
