import { ChangeDetectorRef, Component, Injector, Input, NgZone, OnInit, Renderer2 } from '@angular/core';

import { BaseComponent } from '@components/base';
import { HighlightsService } from '@services/highlights/highlights.service';

@Component({
  selector: 'home-promos-block',
  templateUrl: './promos-block.component.html',
  styleUrls: ['./promos-block.component.scss'],
})
export class PromosBlockComponent extends BaseComponent implements OnInit {
  public promos = [];

  public loaded = false;

  public scrollListener: () => void;

  constructor(
    public injector: Injector,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private highlightsSrv: HighlightsService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      this.scrollListener = this.renderer.listen('window', 'scroll', () => {
        if (this.domSrv.scrollUnderOverElement('#promos', 0, false, false, true)) {
          void this.checkScrollLoad();
        }
      });
    });
  }

  public async checkScrollLoad(): Promise<void> {
    if (!this.loaded) {
      if (this.scrollListener) {
        this.scrollListener();
      }
      await this.loadHighlightPromos();
      this.loaded = true;
      this.cdr.detectChanges();
    }
  }

  public async loadHighlightPromos(): Promise<void> {
    // this.promos = await this.highlightsSrv.getHighlights();
    const promos = await this.highlightsSrv.getHighlights();

    this.promos = promos.slice(0, 1);
  }
}
