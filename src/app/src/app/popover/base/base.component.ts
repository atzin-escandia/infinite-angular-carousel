import {Injector, Component, ViewEncapsulation} from '@angular/core';
import {TextService, LangService, UtilsService, DomService} from '../../services';

@Component({
  selector: 'popover-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PopoverBaseComponent {
  public textSrv: TextService;
  public langSrv: LangService;
  public utilsSrv: UtilsService;
  public domSrv: DomService;
  public parentRef: any;
  public backgroundDiv: any;

  constructor(public injector: Injector) {
    this.textSrv = this.injector.get(TextService);
    this.langSrv = this.injector.get(LangService);
    this.utilsSrv = this.injector.get(UtilsService);
    this.domSrv = this.injector.get(DomService);
  }

  public start(background: any = {}): void {
    if (background.active) {
      this.background(background.close, background.style);
    }
  }

  public close(): void {
    if (this.backgroundDiv && this.parentRef.contains(this.backgroundDiv)) {
      this.parentRef.removeChild(this.backgroundDiv);
    }
  }

  public background(close: any, style?: string): void {
    // TODO: Universal fix needed
    if (!this.domSrv.isPlatformBrowser()) {
      return;
    }
    this.backgroundDiv = document.createElement('div');
    this.backgroundDiv.classList.add('popover-background');
    this.backgroundDiv.classList.add('popover-background-open');
    this.backgroundDiv.setAttribute('style', style);

    this.parentRef.appendChild(this.backgroundDiv);

    this.backgroundDiv.addEventListener(
      'click',
      (e: any) => {
        e.stopPropagation();
        if (close) {
          close();
        } else {
          this.close();
        }
      },
      false
    );
  }
}
