import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@modules/shared/shared.module';
import { CeilPipe } from './ceil/ceil.pipe';

@NgModule({
  declarations: [
    CeilPipe
  ],
  imports: [
    CommonModule,
    SharedModule,
  ],
  exports: [
    CeilPipe
  ]
})
export class PipesModule { }
