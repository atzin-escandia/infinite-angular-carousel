import { NgModule } from '@angular/core';
import { AdoptionsPageComponent } from './adoptions.page';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@modules/shared/shared.module';
import { AdoptionsRoutingModule } from './adoptions-routing.module';
import { ComponentsModule } from '@modules/farmers-market/components/components.module';

@NgModule({
  declarations: [AdoptionsPageComponent],
  imports: [CommonModule, SharedModule, AdoptionsRoutingModule, ComponentsModule]
})
export class AdoptionsModule {}
