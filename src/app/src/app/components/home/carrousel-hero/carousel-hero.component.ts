import { Component, ViewChild, ElementRef, OnDestroy, Input, Injector, OnInit } from '@angular/core';
import { SlidesInfo } from '@interfaces/slides';
import { RouterService } from '../../../services';
import { TranslocoService } from '@ngneat/transloco';
import { BaseComponent } from '../../base';

@Component({
  selector: 'app-carousel-hero',
  templateUrl: './carousel-hero.component.html',
  styleUrls: ['./carousel-hero.component.scss'],
})
export class CarouselHeroComponent extends BaseComponent implements OnInit, OnDestroy {
  @ViewChild('carousel') carousel: ElementRef;
  @Input() slides: SlidesInfo[];
  @Input() isLoadingSlide: boolean;
  copySlides = [];
  currentSlideIndex = 0;
  intervalId: any;
  touchStartX = 0;
  touchEndX = 0;
  maxSlidesInfiniteCarousel: number;
  isTouchMoveHandled = false;
  isMobile = this.domSrv.getIsDeviceSize();

  constructor(public injector: Injector, public routerSrv: RouterService, public translocoSrv: TranslocoService) {
    super(injector);
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

  handleButtonClick(buttonInfo: any): void {
    const URLLink = this.translocoSrv.translate(buttonInfo.urlKey);
    const isInternalLink = URLLink.includes(this.env.domain);
    const path = this.routerSrv.setRouteToCurrentDomain(this.env.domain);
    const route = this.routerSrv.getRouteFromURL(path);
    const isNewTab = buttonInfo?.openNewTab;

    if (isInternalLink && !isNewTab) {
      this.routerSrv.navigate(route);
    } else {
      if (this.domSrv.isPlatformBrowser()) {
        window.open(URLLink, isNewTab ? '_blank' : '_self');
      }
    }
  }
}
