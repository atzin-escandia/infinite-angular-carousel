import { Component, Injector, Input, ViewEncapsulation, OnInit } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { Subject, takeUntil } from 'rxjs';
import { DomService, RouterService } from '@app/services';
import { BaseComponent } from '@components/base';
import { DISPLAY_BLOCKS, BLOCK_MODE, IBlocksToDisplay, IInfoTextImage } from './constants/landing.constants';

@Component({
  selector: 'landing-text-image',
  templateUrl: './landing-text-image.component.html',
  styleUrls: ['./landing-text-image.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LandingTextImageComponent extends BaseComponent implements OnInit {
  @Input() block: string;
  @Input() mode: string;
  @Input() info: IInfoTextImage;
  @Input() isHeader = false;
  blocksToDisplay: IBlocksToDisplay;

  scrollSubject$ = new Subject<void>();

  constructor(
    public injector: Injector,
    public routerSrv: RouterService,
    public domSrv: DomService,
    public translocoSrv: TranslocoService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.setBlocksToDisplayByMode();
    this.info = {
      ...this.info,
      ...{ variant: 'primary', width: 'fit', size: 'm' },
    };
  }

  handleScrollEvent(): void {
    this.scrollSubject$.next();
  }

  setBlocksToDisplayByMode(): void {
    this.blocksToDisplay = DISPLAY_BLOCKS.get(BLOCK_MODE[this.mode]);
  }
}
