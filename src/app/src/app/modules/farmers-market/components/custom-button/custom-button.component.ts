import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy, HostListener } from '@angular/core';
@Component({
  selector: 'custom-button',
  templateUrl: './custom-button.component.html',
  styleUrls: ['./custom-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomButtonComponent implements OnInit {
  @HostListener('mouseover') onMouseOver(): void {
    this.keyColor = 'content-one';
  }
  @HostListener('mouseout') onMouseOut(): void {
    this.keyColor = 'content-two';
  }

  // Sets button Size ("m" or "s". Default is "m")
  @Input() public size = 'm';
  @Input() public variant: 'primary' | 'secondary' | 'danger' | 'ghost' = 'primary';
  @Input() public inverse = false;

  // Set brackground button to white
  @Input() public light = false;

  @Input() public disabled = false;
  @Input() public active = false;
  // Sets width (auto (fit contents), full (100%) or XXX (exact pixels). Default is auto)
  @Input() public width = 'auto';
  @Input() public hasContent: boolean;
  @Input() public content = 'button';
  @Input() public icon: string;
  @Input() public hasIcon = false;
  @Input() public iconColor: string;
  @Output() public buttonClick = new EventEmitter();

  keyColor = 'content-two';

  ngOnInit(): void {
    this.hasContent = this.content.length !== 0;
  }

  public click(evt: any): void {
    this.buttonClick.emit(evt);
  }
}
