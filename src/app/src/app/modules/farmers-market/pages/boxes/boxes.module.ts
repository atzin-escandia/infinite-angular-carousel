import { NgModule } from '@angular/core';
import { BoxesPageComponent } from './boxes.page';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@modules/shared/shared.module';
import { BoxesRoutingModule } from './boxes-routing.module';
import { ComponentsModule } from '@modules/farmers-market/components/components.module';

@NgModule({
  declarations: [
    BoxesPageComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    BoxesRoutingModule,
    ComponentsModule
  ]
})
export class BoxesModule { }
