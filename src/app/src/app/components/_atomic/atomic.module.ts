import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../modules/shared/shared.module';
import * as ATOMS from './atoms';
import * as MOLECULES from './molecules';

const _ATOMS = [
  ATOMS.CardComponent,
  ATOMS.CustomInputComponent,
  ATOMS.RadioButtonComponent,
  ATOMS.CustomSelectComponent,
  ATOMS.CustomSpinnerComponent,
  ATOMS.CustomChipComponent,
  ATOMS.CustomTooltipComponent,
];

const _MOLECULES = [MOLECULES.CollapsableCardComponent, MOLECULES.AutocompleteComponent, MOLECULES.AccordionRowComponent];

@NgModule({
  declarations: [..._ATOMS, ..._MOLECULES],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SharedModule],
  exports: [..._ATOMS, ..._MOLECULES],
})
export class AtomicModule {}
