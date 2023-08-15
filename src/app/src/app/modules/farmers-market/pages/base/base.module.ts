import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@modules/shared/shared.module';
import { BasePageComponent } from '@modules/farmers-market/pages/base/base.page';

@NgModule({
  declarations: [
    BasePageComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
  ]
})
export class BaseModule { }
