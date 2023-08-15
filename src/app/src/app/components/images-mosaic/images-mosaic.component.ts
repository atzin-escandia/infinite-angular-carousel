import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { DUMMY_IMAGE, MAX_SIZE_IMAGE, MAX_LIMIT_IMAGES } from './constants/images-mosaic.constant';
import { ImagesDTO } from './interfaces/images-dto';

@Component({
  selector: 'images-mosaic',
  templateUrl: './images-mosaic.component.html',
  styleUrls: ['./images-mosaic.component.scss'],
})
export class ImagesMosaicComponent implements AfterViewInit {
  /**
   * mosaicGrid
   */
  @ViewChild('mosaicGrid') mosaicGrid!: ElementRef;

  @Input() set imagesList(newValue: string[] | ImagesDTO[]) {
    this.setImagesList(newValue);
  }

  @Input() isShadow = false;

  @Input() isOrder = false;

  @Input() isItemList = false;

  @Input() isRadiusFixed = false;

  images: ImagesDTO[] = [];
  areMoreImages = false;
  mosaicHeight: number;
  sizeImg: number = MAX_SIZE_IMAGE;

  constructor(private cdr: ChangeDetectorRef) {}

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.setHeight();
  }

  ngAfterViewInit(): void {
    this.setHeight();
  }

  setHeight(): void {
    this.mosaicHeight = this.mosaicGrid.nativeElement.offsetWidth;
    this.cdr.detectChanges();
  }

  /**
   * Set the initial list of images to be displayed
   *
   * @param images
   */
  setImagesList(images: string[] | ImagesDTO[]): void {
    if (images.length) {
      this.areMoreImages = images.length > MAX_LIMIT_IMAGES;
      const imgs = images.slice(0, MAX_LIMIT_IMAGES);

      if ((imgs[0] as ImagesDTO).src) {
        this.images = imgs as ImagesDTO[];
      } else if (imgs.length) {
        this.images = (imgs as string[]).map((imgSrc: string) => ({ src: imgSrc, available: true }));
      }
    }
  }
}
