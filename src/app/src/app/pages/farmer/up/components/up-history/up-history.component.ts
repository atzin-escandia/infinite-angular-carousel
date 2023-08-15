import { Component, Injector, Input, ViewEncapsulation, OnChanges, OnInit } from '@angular/core';
import { BaseComponent } from '@components/base';
import { CountryService, RouterService, UpService } from '@app/services';
import { CDNPipe } from '@app/pipes/cdn';
@Component({
  selector: 'up-history',
  templateUrl: './up-history.component.html',
  styleUrls: ['./up-history.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UpHistoryComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() up: any;
  @Input() farm: any;
  @Input() videoURL: string;
  @Input() farmer: any;
  @Input() lang: string;

  public unfoldFarmerText = false;
  public unfoldFarmText = false;
  public embeddedFarmerPicURL: string;
  public embeddedFarmPicURL: string;

  constructor(
    public injector: Injector,
    private countrySrv: CountryService,
    private routerSrv: RouterService,
    private pipe: CDNPipe,
    public upSrv: UpService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    setTimeout(() => {
      if (this.domSrv.isPlatformBrowser() && this.domSrv.getElement('.map-frame')) {
        this.domSrv.getElement('.map-frame').setAttribute('src', this.farm.mapURL);
      }
    }, 200);
  }

  ngOnChanges(): void {
    if (this.lang && this.farmer && this.farm) {
      if (this.farmer._m_biography[this.lang].includes('{picture}')) {
        this.embeddedFarmerPicURL =
          '\n\n <figure><img src="' + this.pipe.transform(this.farmer.historyFarmerPicture, 500) + '"></figure>\n\n';
      }
      if (this.farm._m_description[this.lang].includes('{picture}')) {
        this.embeddedFarmPicURL = '\n\n <figure><img src="' + this.pipe.transform(this.farm.historyFarmPicture, 500) + '"></figure>\n\n';
      }
    }
  }

  public unfoldText(farmer: boolean): void {
    if (farmer) {
      this.unfoldFarmerText = !this.unfoldFarmerText;
      if (!this.unfoldFarmerText) {
        this.domSrv.scrollTo('#farmer-history');
      }
    } else {
      this.unfoldFarmText = !this.unfoldFarmText;
      if (!this.unfoldFarmText) {
        this.domSrv.scrollTo('#farm-history');
      }
    }
  }
}
