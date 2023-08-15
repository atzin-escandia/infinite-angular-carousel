import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@modules/shared/shared.module';
import { ProjectCardComponent } from './project-card.component';
import { FavouriteBtnModule } from '../../favourite-btn/favourite-btn.module';

@NgModule({
  declarations: [ProjectCardComponent],
  imports: [CommonModule, SharedModule, FavouriteBtnModule],
  exports: [ProjectCardComponent],
})
export class ProjectCardModule {}
