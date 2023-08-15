import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'app-go-share-boxes-popup',
  templateUrl: './go-share-boxes-popup.component.html',
  styleUrls: ['./go-share-boxes-popup.component.scss']
})
export class GoShareBoxesPopupComponent {
  @ViewChild('carouselContent') carouselContent: ElementRef;

  private translatedPx = 0;
  showTooltip = false;
  step = 1;
  steps: { fileName: string; transKey: string }[] = [
    { fileName: 'share-boxes-step1.svg', transKey: 'notifications.pick-box.body' },
    { fileName: 'share-boxes-step2.svg', transKey: 'notifications.choose-group-order.body' },
    { fileName: 'share-boxes-step3.svg', transKey: 'notifications.share-boxes.title' },
  ];

  constructor(private renderer2: Renderer2) {}

  onArrowClick(step: -1 | 1, moveSize: number): void {
    if (step === -1 && this.step > 1) {
      this._passSlide(step, moveSize);
    } else if (step === 1 && this.step < this.steps.length) {
      this._passSlide(step, moveSize);
    }
  }

  onMouseOver(): void {
    this.showTooltip = true;
  }

  onMouseLeave(): void {
    this.showTooltip = false;
  }

  private _passSlide(step: -1 | 1, moveSize: number): void {
    this.step += step;
    this.translatedPx = this.translatedPx - moveSize * step;
    this.renderer2.setStyle(this.carouselContent.nativeElement, 'transform', `translateX(${this.translatedPx}px)`);
  }
}
