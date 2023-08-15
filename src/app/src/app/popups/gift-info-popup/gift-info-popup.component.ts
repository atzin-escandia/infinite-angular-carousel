import {Component, ElementRef, Renderer2, ViewChild} from '@angular/core';

@Component({
  selector: 'app-gift-info-popup',
  templateUrl: './gift-info-popup.component.html',
  styleUrls: ['./gift-info-popup.component.scss']
})
export class GiftInfoPopupComponent {
  @ViewChild('carouselContent') carouselContent: ElementRef;
  public itemsList = [
    {
      img: '../../../assets/img/adoption-popup/gift.png',
      text: 'page.how-gift-works-1.text-info'
    }, {
      img: '../../../assets/img/adoption-popup/bird.png',
      text: 'page.how-gift-works-2.text-info'
    }, {
      img: '../../../assets/img/adoption-popup/box.png',
      text: 'page.how-gift-works-3.text-info'
    }
  ];
  public step = 1;
  private translatedPx = 0;
  constructor(private renderer2: Renderer2) { }

  onArrowClick(step: -1 | 1, moveSize: number): void {
    if (step === -1 && this.step > 1) {
      this._passSlide(step, moveSize);
    } else if (step === 1 && this.step < this.itemsList.length) {
      this._passSlide(step, moveSize);
    }
  }

  private _passSlide(step: -1 | 1, moveSize: number): void {
    this.step += step;
    this.translatedPx = this.translatedPx - moveSize * step;
    this.renderer2.setStyle(this.carouselContent.nativeElement, 'transform', `translateX(${this.translatedPx}px)`);
  }
}
