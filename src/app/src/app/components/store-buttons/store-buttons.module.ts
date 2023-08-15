import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@modules/shared/shared.module';
import { StoreButtonsComponent } from './store-buttons.component';

@NgModule({
  declarations: [StoreButtonsComponent],
  imports: [CommonModule, SharedModule],
  exports: [StoreButtonsComponent],
})
export class StoreButtonsModule {}
