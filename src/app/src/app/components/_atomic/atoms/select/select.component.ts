import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'custom-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  animations: [
    trigger('rotateState', [
      state('default', style({ transform: 'rotate(0)' })),
      state('rotated', style({ transform: 'rotate(-180deg)' })),
      transition('rotated => default', animate('250ms ease-out')),
      transition('default => rotated', animate('250ms ease-in')),
    ]),
  ],
})
export class CustomSelectComponent {
  @Input() label = '';
  @Input() disabled = false;
  @Input() value: string | number;
  @Input() placeholder = 'Select an option';
  @Input() options: (string | number)[] = [];

  @Output() selectChange = new EventEmitter<string | number>();

  @HostListener('document:click', ['$event'])
  clickout(event: Event): void {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isFocused = false;
      this.arrowState = 'default';
    }
  }

  isFocused = false;
  arrowState: 'default' | 'rotated' = 'default';

  constructor(private eRef: ElementRef) {}

  onSelectClick(): void {
    this.isFocused = !this.isFocused;
    this.arrowState = this.arrowState === 'rotated' ? 'default' : 'rotated';
  }

  onOptionSelected(opt: string | number): void {
    this.selectChange.emit(opt);
    this.isFocused = false;
    this.arrowState = 'default';
  }
}
