import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  Injector,
  Input,
  Output,
} from '@angular/core';
import { ControlValueAccessor, NgControl, NG_VALUE_ACCESSOR, ValidationErrors } from '@angular/forms';
import { IIcon } from '../../../../modules/purchase/interfaces/icon.interface';
import { TextService, UtilsService } from '../../../../services';

@Component({
  selector: 'custom-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomInputComponent),
      multi: true,
    },
  ],
})
export class CustomInputComponent implements AfterViewInit, ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() icon: IIcon;
  @Input() masks: string[] = [];
  @Input() customError: boolean;
  @Input() customErrorText: string;

  @Output() inputFocus = new EventEmitter<FocusEvent>();
  @Output() inputBlur = new EventEmitter<FocusEvent>();

  ngControl: NgControl;
  value = '';
  isDisabled: boolean;

  get errors(): ValidationErrors {
    return this.ngControl.control.errors;
  }

  onChange = (_: any): void => {};
  onTouch = (): void => {};

  constructor(private injector: Injector, private utilsSrv: UtilsService, private textSrv: TextService, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.ngControl = this.injector.get(NgControl);
  }

  onInput(val: string): void {
    this.value = val;
    if (this.ngControl) {
      this.ngControl.control.setValue(this.value);
      if (!this.ngControl.control.dirty) {
        this.ngControl.control.markAsDirty();
      }
    }
  }

  writeValue(value: any): void {
    this.value = value;
    this.cdr.detectChanges();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.cdr.detectChanges();
  }

  onFocus(e: FocusEvent): void {
    this.inputFocus.emit(e);
  }

  onBlur(e: FocusEvent): void {
    this.inputBlur.emit(e);
  }

  getError(): string {
    return this.utilsSrv.mapFormFieldErrors(this.ngControl.control.errors);
  }
}
