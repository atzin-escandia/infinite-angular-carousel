import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@modules/shared/shared.module';
import { CountriesPrefixModule } from '../countries-prefix/countries-prefix.module';
import { CountrySelectorModule } from '../country-selector/country-selector.module';
import { ProjectCardModule } from '../home/project-card/project-card.module';
import { AgroupmentComponent } from './agroupment.component';

@NgModule({
  declarations: [AgroupmentComponent],
  imports: [CommonModule, SharedModule, FormsModule, CountrySelectorModule, CountriesPrefixModule, ProjectCardModule],
  exports: [AgroupmentComponent],
})
export class AgroupmentModule {}
