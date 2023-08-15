import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@modules/shared/shared.module';
import { FavouriteBtnComponent } from './favourite-btn.component';

@NgModule({
  declarations: [FavouriteBtnComponent],
  imports: [CommonModule, SharedModule],
  exports: [FavouriteBtnComponent],
})
export class FavouriteBtnModule {}
