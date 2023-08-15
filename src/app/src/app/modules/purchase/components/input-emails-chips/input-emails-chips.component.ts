import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-input-emails-chips',
  templateUrl: './input-emails-chips.component.html',
  styleUrls: ['./input-emails-chips.component.scss'],
})
export class InputEmailsChipsComponent {
  @Input() emailsList: string[] = [];
  @Input() maxEmailsLength: number;

  @Output() emailsListChange = new EventEmitter<string[]>();

  inputVal = '';
  isValidEmail = true;
  private readonly minEmailLength = 6;

  onInput(ev: InputEvent): void {
    this.inputVal = (ev.target as HTMLInputElement).value;
  }

  onKeydown(ev: KeyboardEvent): void {
    this.isValidEmail = true;
    const validKeyboardKeys = [' ', 'Spacebar', ',', 'Enter'];

    if (validKeyboardKeys.includes(ev.key)) {
      this.isValidEmail = this._isValidEmailCheck();
      this.isValidEmail && this._setValue(ev.target as HTMLInputElement);
    }
  }

  removeChip(idx: number): void {
    this.emailsListChange.emit([...this.emailsList.filter((_, i) => i !== idx)]);
  }

  private _setValue(target: HTMLInputElement): void {
    this.emailsListChange.emit([...this.emailsList, this.inputVal]);
    this.inputVal = '';
    target.value = '';
    this.isValidEmail = true;
  }

  private _isValidEmailCheck(): boolean {
    if (this.inputVal.length < this.minEmailLength) {
      return false;
    } else if (this.emailsList.includes(this.inputVal) || !this._isValidEmailFormat()) {
      return false;
    }

    return true;
  }

  private _isValidEmailFormat(): boolean {
    // eslint-disable-next-line no-useless-escape
    const regExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    return regExp.test(this.inputVal);
  }
}
