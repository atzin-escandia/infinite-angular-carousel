import {Component, OnInit, Input, Injector} from '@angular/core';
import {BaseComponent} from '../base';

@Component({
  selector: 'image-lazy',
  templateUrl: './image-lazy.component.html',
  styleUrls: ['./image-lazy.component.scss']
})
export class ImageLazyComponent extends BaseComponent implements OnInit {
  @Input() public imageURL: string;
  @Input() public imageAlt = '';
  @Input() public imageId: string;
  @Input() public lazySpace = 400;
  @Input() public index: number;
  @Input() public startLazyAt: number;
  @Input() public fixWidth: number;
  public isHidden = true;

  public debounceTimeout: any;

  constructor(public injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    if (this.domSrv.isPlatformBrowser()) {
      if (this.index < this.startLazyAt) {
        this.isHidden = false;
      } else {
        window.addEventListener('scroll', () => this.scrollEvn());
      }
    }
  }

  private scrollEvn(): void {
    // TODO: Universal fix needed
    if (this.domSrv.isPlatformBrowser() && !this.debounceTimeout && this.isHidden) {
      const elm: HTMLElement = document.querySelector('#' + this.imageId);

      if (!elm) {
        return;
      }
      const pos: any = elm.getBoundingClientRect();

      if (pos.y < window.innerHeight + this.lazySpace) {
        this.isHidden = false;
        // eslint-disable-next-line @typescript-eslint/unbound-method
        window.removeEventListener('scroll', this.scrollEvn);
      }

      this.debounceTimeout = setTimeout(() => {
        this.debounceTimeout = null;
      }, 200);
    }
  }
}
