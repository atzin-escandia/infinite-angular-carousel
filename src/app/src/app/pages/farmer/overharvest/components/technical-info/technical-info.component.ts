import { Component, Injector, Input, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from '@components/base';
import { RouterService, CountryService, UpService } from '@app/services';

@Component({
  selector: 'technical-info',
  templateUrl: './technical-info.component.html',
  styleUrls: ['./technical-info.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TechnicalInfoComponent extends BaseComponent {
  @Input() public extraInfo: any;

  constructor(public injector: Injector, public routerSrv: RouterService, public countrySrv: CountryService, public upSrv: UpService) {
    super(injector);
  }
}
