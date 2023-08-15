import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@modules/shared/shared.module';
import { SellPageComponent } from './sell.page';

@NgModule({
  declarations: [
    SellPageComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
  ]
})
export class SellModule { }
