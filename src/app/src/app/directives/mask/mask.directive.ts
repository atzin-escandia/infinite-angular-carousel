import {Directive, HostListener, Input, ElementRef, OnInit, EventEmitter, Output} from '@angular/core';

const placeholders = {
  A: /^[a-zA-ZA-zА-яЁё]/,
  M: /^[0-9a-zA-ZA-zА-яЁё]/,
  X: '\\d'
};

const keys = {
  BACKSPACE: 8,
  LEFT: 37,
  RIGHT: 39,
  DEL: 46
};

interface IState {
  value: string;
}

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[mask]'
})
export class MaskInputDirective implements OnInit {
  @Input() mask: any;
  @Output() ngModelChange = new EventEmitter();

  private state: IState;
  private currentMask: string;

  constructor(private element: ElementRef) {
    this.state = {
      value: this.getValue()
    };
  }

  @HostListener('input')
  public onChange(): void {
    this.currentMask = this.mask[0];

    if (this.mask.length > 1) {
      for (const maskItem of this.mask) {
        if (this.getBlanklessValue(this.getValue()).length === this.getBlanklessValue(maskItem).length) {
          this.currentMask = maskItem;
          break;
        }
      }
    }

    this.applyMask(this.getBlanklessValue(this.getValue()));
  }
  @HostListener('keyup', ['$event'])
  public onKeyUp(event: string): void {
    const key = this.getKey(event);

    if ((key === keys.BACKSPACE || key === keys.DEL) && this.getBlanklessValue(this.getValue()).length === 1) {
      this.setValue('');
      this.state.value = '';
      this.ngModelChange.emit('');
    }
  }

  public ngOnInit(): void {
    this.currentMask = this.mask[0];
    if (this.mask.length > 1) {
      for (const maskItem of this.mask) {
        if (this.getBlanklessValue(this.getValue()).length === this.getBlanklessValue(maskItem).length) {
          this.currentMask = maskItem;
          break;
        }
      }
    }

    this.applyMask(this.getBlanklessValue(this.getValue()));
  }

  private getKey(event): number {
    return event.keyCode || event.charCode;
  }

  private applyMask(value): void {
    if (!this.currentMask) {
      return;
    }
    let newValue = '';
    let maskPosition = 0;

    if (this.getBlanklessValue(value).length > this.getBlanklessValue(this.currentMask).length) {
      this.setValue(this.state.value);
      // Workaround to update ngModel instead only input value
      this.element.nativeElement.dispatchEvent(new Event('input'));

      return;
    }

    for (let i = 0; i < value.length; i++) {
      const current = value[i];

      const regexp = this.createRegExp(maskPosition);

      if (regexp !== null) {
        if (!regexp.test(current)) {
          this.setValue(this.state.value);
          // Workaround to update ngModel instead only input value
          this.element.nativeElement.dispatchEvent(new Event('input'));
          break;
        }
        newValue += current;
      } else if (this.currentMask[maskPosition] === current) {
        newValue += current;
      } else {
        newValue += this.currentMask[maskPosition];
        i--;
      }

      maskPosition++;
    }

    const nextMaskElement = this.currentMask[maskPosition];

    // eslint-disable-next-line no-useless-escape
    if (value.length && nextMaskElement !== null && /^[-\/\\^$#&@№:<>_\^!*+?.()|\[\]{}]/.test(nextMaskElement)) {
      newValue += nextMaskElement;
    }

    const oldValue = this.state.value;
    const cursorPosition = this.getCursorPosition();

    this.setValue(newValue);
    this.state.value = newValue;

    if (oldValue.length >= cursorPosition) {
      this.setCursorPosition(cursorPosition);
    }
  }

  private createRegExp(position): RegExp | null {
    if (!this.currentMask) {
      return;
    }
    if (this.currentMask[position] == null) {
      return null;
    }

    const currentSymbol = this.currentMask[position].toUpperCase();

    if (!(placeholders[currentSymbol] === null || placeholders[currentSymbol] === undefined)) {
      return new RegExp(placeholders[currentSymbol], 'gi');
    }

    return null;
  }

  private getValue(): string {
    return this.element.nativeElement.value;
  }

  private getClearValue(value): string {
    // eslint-disable-next-line no-useless-escape
    return value.trim().replace(/[-\/\\^$#&@№:<>_\^!*+?.()|\[\]{}]/gi, '');
  }

  private getBlanklessValue(value): string {
    if (value) {
      return value.replace(/ /g, '');
    } else {
      return '';
    }
  }

  private setValue(value: string): void {
    this.element.nativeElement.value = value;
  }

  private getCursorPosition(): number {
    return this.element.nativeElement.selectionStart;
  }

  private setCursorPosition(start: number, end: number = start): void {
    this.element.nativeElement.setSelectionRange(start, end);
  }
}
