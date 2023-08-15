import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'cf-banner-custom-box',
  templateUrl: './banner-custom-box.component.html',
  styleUrls: ['./banner-custom-box.component.scss'],
})
export class BannerCustomBoxComponent {
  // Input
  @Input() title = '';
  @Input() description: string;
  @Input() labelEvent: string;
  // Ouputs
  @Output() goTo = new EventEmitter();
}
