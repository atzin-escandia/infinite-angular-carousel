import { Directive, Input, Output, EventEmitter, HostListener } from '@angular/core';

// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({ selector: '[copyToClipboard]' })
export class CopyClipboardDirective {

  @Input('copyToClipboard')
  public payload: string;

  @Output() copied = new EventEmitter<string>();

  @HostListener('click', ['$event'])
  public async onClick(event: MouseEvent): Promise<void> {
    event.preventDefault();

    const listener = (e: ClipboardEvent): void => {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      const clipboard = e.clipboardData || window['clipboardData'];

      clipboard.setData('text', this.payload.toString());
      e.preventDefault();
      this.copied.emit(this.payload);
    };

    if (this.payload) {
      document.addEventListener('copy', listener, false);
      document.removeEventListener('copy', listener, false);
      try {
        await navigator.clipboard.writeText(this.payload);
      } catch (e) {
        // copy not allowed
      }
    }
  }
}
