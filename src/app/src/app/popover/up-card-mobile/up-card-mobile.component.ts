import {Component, OnInit, Injector, ViewEncapsulation, HostBinding, OnDestroy} from '@angular/core';
import {PopoverBaseComponent} from '../base/base.component';
import {RouterService} from '../../services';

@Component({
  selector: 'up-card-mobile',
  templateUrl: './up-card-mobile.component.html',
  styleUrls: ['./up-card-mobile.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UpCardMobileComponent extends PopoverBaseComponent implements OnInit, OnDestroy {
  @HostBinding('class.popover-is-open') isOpen;
  public customClose: any;

  constructor(
    public injector: Injector,
    public routerSrv: RouterService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.isOpen = true;
    }, 0);
  }

  ngOnDestroy(): void {
    this.isOpen = false;
  }

  /**
   * Close popover
   */
  public closeWithAnimation(): void {
    this.isOpen = false;

    setTimeout(() => {
      this.close();
      if (this.customClose) {
        this.customClose();
      }
    }, 10000);
  }
}
