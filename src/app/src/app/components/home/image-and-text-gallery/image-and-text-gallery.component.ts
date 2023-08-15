import { Component, Input, Injector } from '@angular/core';
import { BaseComponent } from '@components/base';

@Component({
  selector: 'image-and-text-gallery',
  templateUrl: './image-and-text-gallery.component.html',
  styleUrls: ['./image-and-text-gallery.component.scss'],
})
export class ImageAndTextGalleryComponent extends BaseComponent {
  @Input() public id: string;
  @Input() public images: string[] = [];
  @Input() public currentImage = 0;
  @Input() public lazyImage = 4;
  @Input() public effect = 'translate';
  @Input() public round = false;

  constructor(public injector: Injector) {
    super(injector);
  }
}
