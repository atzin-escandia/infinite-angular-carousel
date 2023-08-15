import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApologyRoutingModule } from './apology-routing.module';
import { ApologyPageComponent } from './apology.page';
import { SharedModule } from '../../../modules/shared/shared.module';

import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    ApologyPageComponent,
  ],
  imports: [
    CommonModule,
    ApologyRoutingModule,
    FormsModule,
    SharedModule
  ]
})
export class ApologyModule { }
