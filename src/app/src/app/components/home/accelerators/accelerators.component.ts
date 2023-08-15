import { Component, ElementRef, Injector, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { RouterService } from '@app/services';
import { BaseComponent } from '@components/base';
import { TranslocoService } from '@ngneat/transloco';
import { AcceleratorInfo } from '@interfaces/accelerators';
@Component({
  selector: 'accelerators',
  templateUrl: './accelerators.component.html',
  styleUrls: ['./accelerators.component.scss'],
})
export class AcceleratorsComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() accelerators: AcceleratorInfo[];
  @Input() animate = false;
  @ViewChild('scrollDivRef') scrollDivRef: ElementRef;
  isMobile = this.domSrv.getIsDeviceSize();

  constructor(public injector: Injector, public routerSrv: RouterService, public translocoSrv: TranslocoService) {
    super(injector);
  }

  ngOnInit(): void {
    this.accelerators.sort((a, b) => a.position - b.position);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.animate.previousValue === undefined) {
      this.scrollDivRef && this.isMobile && this.scrollDiv();
    }
  }

  redirectFilters(urlKey: string): void {
    const URLLink = this.translocoSrv.translate(urlKey);

    if (URLLink.includes(this.env.domain)) {
      const path = this.routerSrv.getRouteFromURL(URLLink, this.env.domain);

      this.routerSrv.navigate(path);
    } else {
      window.location = URLLink;
    }
  }

  scrollDiv(): void {
    const scrollableDiv = this.scrollDivRef.nativeElement;
    const currentPosition = scrollableDiv.scrollLeft;
    const targetPosition = currentPosition + 200;

    this.handleScroll(targetPosition, 600);
    this.handleScroll(0, 800);
  }

  handleScroll(toLeft: number, timeOut: number): void {
    setTimeout(() => {
      this.scrollDivRef.nativeElement.scrollTo({
        left: toLeft,
        behavior: 'smooth',
      });
    }, timeOut);
  }
}
