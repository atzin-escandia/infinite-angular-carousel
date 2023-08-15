import {Component, OnInit, Injector, ViewEncapsulation} from '@angular/core';
import {PopoverBaseComponent} from '../base/base.component';
import {
  TextService,
  UtilsService,
  AuthService,
  LangService,
  UpService,
  RouterService,
  LoaderService,
  UserService,
  DomService
} from '../../services';

@Component({
  selector: 'invest-popover',
  templateUrl: './invest-popover.html',
  styleUrls: ['./invest-popover.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InvestPopoverComponent extends PopoverBaseComponent implements OnInit {
  public privacy: any;
  public btnText = '';
  public text = '';
  public maxMinText = '';
  public onClose: any;
  public user: any;

  constructor(
    public injector: Injector, public domSrv: DomService,
    public textSrv: TextService, public utilsSrv: UtilsService,
    public authSrv: AuthService, public langSrv: LangService,
    public upSrv: UpService, public userSrv: UserService,
    public routerSrv: RouterService, public loaderSrv: LoaderService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.text = 'modal-registered-text';
    this.maxMinText = 'modal max min text';
    this.btnText = 'invest in fututre button';
    this.domSrv.addClasses('.invest-popover', ['show']);
  }

  scrollToGreenBlock(): void {
    this.domSrv.scrollTo('#green-block');
    setTimeout(() => {
      this.onClose();
    }, 1000);
  }
}
