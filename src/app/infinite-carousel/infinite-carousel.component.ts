import { Component, OnDestroy, Input, OnInit } from '@angular/core';
import { SlidesInfo } from './slides';

@Component({
  selector: 'app-infinite-carousel',
  templateUrl: './infinite-carousel.component.html',
  styleUrls: ['./infinite-carousel.component.scss'],
})
export class InfiniteCarouselComponent implements OnInit, OnDestroy {
  @Input() slides: SlidesInfo[] = [];
  copySlides: SlidesInfo[] = [];
  currentSlideIndex = 0;
  intervalId: any;
  touchStartX = 0;
  touchEndX = 0;
  maxSlidesInfiniteCarousel: number = 0;
  isTouchMoveHandled = false;
  isMobile = this.isMobileDevice();

  constructor() {
  }

  ngOnInit(): void {
    if (this.slides) {
      this.slides.sort((a, b) => a.position - b.position);
      this.maxSlidesInfiniteCarousel = this.slides.length * 15; // Reset infinite scroll every 30-45 slides
      this.copySlides = [...this.slides];
    }

    this.startAutoTransition();
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
    this.isTouchMoveHandled = false;
  }

  onTouchMove(event: TouchEvent): void {
    if (this.isTouchMoveHandled) {
      return;
    }

    this.touchEndX = event.touches[0].clientX;
    const touchDiff = this.touchStartX - this.touchEndX;
    const threshold = 50;

    if (Math.abs(touchDiff) > threshold) {
      if (touchDiff > 0) {
        this.goToNextSlide();
      } else {
        this.goToPreviousSlide();
      }
      this.isTouchMoveHandled = true;
    }
  }

  onTouchEnd(): void {
    this.isTouchMoveHandled = false;
  }

  ngOnDestroy(): void {
    this.stopAutoTransition();
  }

  isMobileDevice(): boolean {
    return /iPhone|iPad|iPod|Android|webOS|BlackBerry|Windows Phone/i.test(navigator.userAgent);
  }

  startAutoTransition(): void {
    this.slides.length > 1 &&
      (this.intervalId = setInterval(() => {
        this.goToNextSlide();
      }, 3000));
  }

  stopAutoTransition(): void {
    clearInterval(this.intervalId);
  }

  goToSlide(index: number): void {
    this.currentSlideIndex = index;
    this.stopAutoTransition();
  }

  goToNextSlide(): void {
    this.copySlides.length > this.maxSlidesInfiniteCarousel && this.copySlides.splice(0, this.maxSlidesInfiniteCarousel);
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.copySlides.length;

    const nextSlideIndex = (this.currentSlideIndex + 1) % this.slides.length;

    nextSlideIndex === 0 && this.copySlides.push(...this.slides);
  }

  goToPreviousSlide(): void {
    if (this.currentSlideIndex < 1) {
      return;
    }
    this.currentSlideIndex = (this.currentSlideIndex - 1) % this.copySlides.length;
  }

  getActiveDotIndex(): number {
    return this.currentSlideIndex % this.slides.length;
  }
}


