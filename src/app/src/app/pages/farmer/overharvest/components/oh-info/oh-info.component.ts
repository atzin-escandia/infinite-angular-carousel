import { Component, Injector, Input, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from '@components/base';
import { RouterService, CountryService } from '@app/services';

@Component({
  selector: 'oh-info',
  templateUrl: './oh-info.component.html',
  styleUrls: ['./oh-info.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OhInfoComponent extends BaseComponent {
  @Input() public info: any;
  public unfold = false;

  constructor(public injector: Injector, public routerSrv: RouterService, public countrySrv: CountryService) {
    super(injector);
  }

  public unfoldText(): void {
    this.unfold = !this.unfold;

    if (!this.unfold) {
      this.domSrv.scrollTo('#' + this.info.id, -100);
    }
  }
}
