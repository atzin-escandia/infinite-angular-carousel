import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AUTO_STYLE, animate, state, style, transition, trigger, AnimationEvent } from '@angular/animations';
import { IAccordionOption } from '../../../../modules/purchase/interfaces/accordion-option.interface';

@Component({
  selector: 'accordion-row',
  templateUrl: './accordion-row.component.html',
  styleUrls: ['./accordion-row.component.scss'],
  animations: [
    trigger('collapse', [
      state('false', style({ height: AUTO_STYLE, visibility: AUTO_STYLE })),
      state('true', style({ height: '0', visibility: 'hidden' })),
      transition('false => true', animate(250 + 'ms ease-in')),
      transition('true => false', animate(250 + 'ms ease-out')),
    ]),
  ],
})
export class AccordionRowComponent {
  @Input() option: IAccordionOption;
  @Input() isChecked = false;
  @Input() canExpand = true;

  @Output() radioChange = new EventEmitter<string>();

  public animationDone = false;

  onRadioChange(): void {
    this.radioChange.emit(this.option.key);
  }

  public onAnimationEvent(e: AnimationEvent): void {
    this.animationDone = this.isChecked && e.phaseName === 'done';
  }
}
