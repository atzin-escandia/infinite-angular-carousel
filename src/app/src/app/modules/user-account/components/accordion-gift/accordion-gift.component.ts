import { Component, Input, Injector, OnInit } from '@angular/core';
import { BaseComponent } from '@app/components';
import { AccordionGift } from '../../interfaces/order.interface';
@Component({
  selector: 'accordion-gift',
  templateUrl: './accordion-gift.component.html',
  styleUrls: ['./accordion-gift.component.scss']
})

export class AccordionGiftComponent extends BaseComponent implements OnInit {
  @Input() data: AccordionGift;
  @Input() isGift = false;
  public isOpen = true;
  public message: string;

  constructor(
    public injector: Injector,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.message = this.data.header.gift.isGifter
      ? 'global.sent-as-a-gift.text-info'
      : 'global.received-as-a-gift.text-info';
  }

  public toggleOpen(): void {
    this.isOpen = !this.isOpen;
  }
}
