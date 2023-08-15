import { Component, Injector, OnInit } from '@angular/core';
import { BaseComponent } from '@components/base';
import { RouterService } from '@app/services';
import { HomeService } from '@services/home/home.service';

@Component({
  selector: 'global-header',
  templateUrl: './global-header.component.html',
  styleUrls: ['./global-header.component.scss'],
})
export class GlobalHeaderComponent extends BaseComponent implements OnInit {
  public isMobile: boolean;
  public homeHeaderData: any;
  public loaded = false;

  constructor(public injector: Injector, public routerSrv: RouterService, public homeSrv: HomeService) {
    super(injector);
    this.isMobile = this.domSrv.getIsDeviceSize();
  }

  async ngOnInit(): Promise<void> {
    await this.loadHeaderHome();
  }

  public async loadHeaderHome(): Promise<void> {
    this.homeHeaderData = await this.homeSrv.getHome();
    this.loaded = true;
  }
}
