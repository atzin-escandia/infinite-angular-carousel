import {Component, OnInit, EventEmitter, Output, Input, Injector} from '@angular/core';
import {BaseComponent} from '../base';

@Component({
  selector: 'image-gallery',
  templateUrl: './image-gallery.component.html',
  styleUrls: ['./image-gallery.component.scss']
})
export class ImageGalleryComponent extends BaseComponent implements OnInit {
  @Input() public currentImage = 0;
  @Input() public id: string;
  @Input() public images: any;
  @Input() public imagesAlts: string[] = [];
  @Input() public lazyImage = 2;
  @Input() public arrows = true;
  @Input() public autoplay = true;
  @Input() public fixedHeight = false;
  @Output() public changeEvt = new EventEmitter();

  public photoInterval: any;
  public maxLazy: number;

  constructor(public injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    if (this.autoplay) {
      this.photosInterval(7500);
    }

    this.maxLazy = this.lazyImage;
  }

  /**
   * Changes image
   *
   * @param step 1 | -1 | page
   */
  public changeImage(step: number): void {
    if ((step < 0 && this.currentImage === 0) || (step > 0 && this.currentImage >= this.images.length - 1)) {
      return;
    }

    this.currentImage += step;

    clearInterval(this.photoInterval);
    if (this.autoplay) {
      this.photosInterval(15000);
    }
    this.changeEvt.emit(step);
  }

  public photosInterval(time: number): void {
    if (!this.domSrv.isPlatformBrowser() || !this.autoplay) {
      return;
    }
    this.photoInterval = setInterval(() => {
      if (this.currentImage < this.images.length - 1) {
        this.currentImage++;
      } else {
        this.currentImage = 0;
      }
    }, time);
  }

  public isLazyImage(i: number): boolean {
    const newMax = this.currentImage + this.lazyImage;

    if (this.maxLazy < this.images.length && newMax > this.maxLazy) {
      this.maxLazy = newMax;
    }

    return i < this.maxLazy;
  }
}
