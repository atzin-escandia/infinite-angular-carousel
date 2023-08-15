import { Component, ElementRef, Input, Renderer2, ViewChild } from '@angular/core';
import { TextService } from '../../../../services';

@Component({
  selector: 'farmers-carousel',
  templateUrl: './farmers-carousel.component.html',
  styleUrls: ['./farmers-carousel.component.scss'],
})
export class FarmersCarouselComponent {
  @ViewChild('carouselContent') carouselContent: ElementRef;

  @Input() farmers: any[] = [];

  private translatedPx = 0;
  public step = 1;

  get isActiveCarousel(): boolean {
    return this.farmers.length > 3;
  }

  constructor(public textSrv: TextService, private renderer2: Renderer2) {}

  public onArrowClick(step: -1 | 1, moveSize: number): void {
    if (step === -1 && this.step > 1) {
      this.passFarmer(step, moveSize);
    } else if (step === 1 && this.step < this.farmers.length) {
      this.passFarmer(step, moveSize);
    }
  }

  private passFarmer(step: -1 | 1, moveSize: number): void {
    this.step += step;
    this.translatedPx = this.translatedPx - moveSize * step;
    this.renderer2.setStyle(this.carouselContent.nativeElement, 'transform', `translateX(${this.translatedPx}px)`);
  }
}
