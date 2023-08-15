import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, UntypedFormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { IIcon } from '../../../../modules/purchase/interfaces/icon.interface';
import { IAutocompleteOpt } from '../../interfaces/autocomplete.interface';

@Component({
  selector: 'autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
})
export class AutocompleteComponent {
  @Input() label: string;
  @Input() set options(options: IAutocompleteOpt[]) {
    this._options = (options || []).sort((a, b) => a.label.localeCompare(b.label));
  }

  get options(): IAutocompleteOpt[] {
    return this._options;
  }

  @Input() set value(value: string) {
    if (value) {
      this.inputFC.setValue(value);
    }
  }

  @Input() set icon(icon: IIcon) {
    this._icon = icon.code ? icon : null;
  }

  get icon(): IIcon {
    return this._icon;
  }

  @Output() valueChanges = new EventEmitter<{ key: string; errors: ValidationErrors }>();

  private _options: IAutocompleteOpt[] = [];
  private _icon: IIcon = null;
  // eslint-disable-next-line @typescript-eslint/unbound-method
  public inputFC = new UntypedFormControl(null, Validators.compose([Validators.required, this.invalidValueValidator()]));
  public filteredOpts: IAutocompleteOpt[] = [];
  public isInputFocused = false;

  get showOptsList(): boolean {
    return this.isInputFocused && !!this.inputFC.value && this.filteredOpts.length > 0;
  }

  onInput(e: any): void {
    const value = e.target.value.trim().toLowerCase();

    this.filteredOpts = this.options.filter((option) => option.label.toLowerCase().includes(value));
    const matchOpt = this.options.find((option) => option.label.toLowerCase().includes(value));

    this.valueChanges.emit({
      key: matchOpt ? matchOpt.key : null,
      errors: this.inputFC.errors,
    });
  }

  onFocus(): void {
    this.isInputFocused = true;
  }

  onBlur(): void {
    setTimeout(() => {
      this.isInputFocused = false;
    }, 125);
  }

  isFlagIcon(opt: IAutocompleteOpt): boolean {
    return !!opt.img && opt.img.includes('flag-icon');
  }

  onOptionSelected(opt: IAutocompleteOpt): void {
    this.filteredOpts = [];
    this.inputFC.setValue(opt.label);
    this.valueChanges.emit({ key: opt.key, errors: null });
  }

  private invalidValueValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const isValid = !!this.options.find((elem) => elem.label === control.value);

      return !isValid ? { invalidValue: { value: control.value } } : null;
    };
  }
}
