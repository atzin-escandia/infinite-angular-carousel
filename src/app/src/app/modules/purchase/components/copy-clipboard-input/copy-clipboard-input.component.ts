import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-copy-clipboard-input',
  templateUrl: './copy-clipboard-input.component.html',
  styleUrls: ['./copy-clipboard-input.component.scss'],
})
export class CopyClipboardInputComponent {
  @Input() copyText: string;

  showTooltip = false;

  onMouseOver(): void {
    this.showTooltip = true;
  }

  onMouseLeave(): void {
    this.showTooltip = false;
  }
}
