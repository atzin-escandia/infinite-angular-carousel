import {
  Component,
  ElementRef,
  HostListener,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'dropdown-select',
  templateUrl: './dropdown-select.component.html',
  styleUrls: ['./dropdown-select.component.scss'],
})
export class DropdownSelectComponent implements OnChanges {
  @Input() public id: string;
  @Input() public required = '';
  @Input() public disabled = false;
  @Input() public optional = '';
  @Input() public placeholder: any;
  @Input() public options: any;
  @Input() public selectedOption: any;
  @Input() public direction: 'up' | 'down' = 'down';
  @Input() public size: 's' | 'm' = 's';
  @Input() public justify: 'flex-start' | 'flex-end' | 'center' | 'space-between' = 'flex-start';
  @Input() public icon?: string;

  @Output() public emitSelectOption = new EventEmitter();

  public selectOpen = false;

  constructor(private eRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  clickout(event: any): void {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.selectOpen = false;
    }
  }

  @HostListener('document:keyup', ['$event'])
  keyup(event: any): void {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.selectOpen = false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.options?.currentValue.length) {
      this.placeholder = this.options[0];
    }
  }

  public toggleSelect(): void {
    this.selectOpen = !this.selectOpen;
  }

  public selectOption(option: any): void {
    this.toggleSelect();
    this.selectedOption = option;
    this.emitSelectOption.emit(this.selectedOption);
  }
}
