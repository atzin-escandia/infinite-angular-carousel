import { Component, OnInit, Injector, HostBinding, AfterViewInit } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { BasePage } from '@app/pages';
import { TrackingConstants, TrackingService, UserService } from '@app/services';

@Component({
  selector: 'my-garden',
  templateUrl: './my-garden.page.html',
  styleUrls: ['./my-garden.page.scss']
})
export class MyGardenPageComponent extends BasePage implements OnInit, AfterViewInit {
  @HostBinding('class') classes = 'col-12 col-md-12 nopl nopr';

  public userUps: boolean;
  public onSeasonUps: any = [];
  public outOfSeasonUps: any = [];
  public oldGardenUps: any = [];

  // Tabs
  public tabsIds: string[];
  public myGardenTabs: string[];
  public currentTab = 0;
  public onSeasonTab = true;
  public outOfSeasonTab = false;
  public oldGardenTab = false;

  public loaded = false;

  constructor(
    public injector: Injector,
    public userSrv: UserService,
    public translocoSrv: TranslocoService,
    private trackingSrv: TrackingService,
  ) {
    super(injector);
  }

  async ngOnInit(): Promise<void> {
    // User ups status
    this.onSeasonUps = await this.userSrv.getUserUps('on-season');
    // Check userUps
    this.userUps = this.onSeasonUps.length > 0 || this.outOfSeasonUps.length > 0 || this.oldGardenUps.length > 0;
    // Tabs
    this.tabsIds = ['On season', 'Out of season', 'Old garden'];
    this.myGardenTabs = ['global.donate.body', 'global.out-of-season.text-info', 'page.older-adoptions.tab'];
    // Let private zone menu know that this component is open
    this.eventSrv.dispatchEvent('private-zone-url', {router: this.routerSrv.getPath()});
    this.setLoading(false);
    this.setInnerLoader(false, false);

    this.loaded = true;
  }

  // Change section
  async changeTab(e: any): Promise<boolean> {
    this.currentTab = e;
    this.onSeasonTab = false;
    this.outOfSeasonTab = false;
    this.oldGardenTab = false;

    switch (e) {
      case 0:
        return (this.onSeasonTab = true);
      case 1:
        this.outOfSeasonUps = this.outOfSeasonUps.length > 0 ? this.outOfSeasonUps : await this.userSrv.getUserUps('out-of-season');

        return (this.outOfSeasonTab = true);
      case 2:
        this.oldGardenUps = this.oldGardenUps.length > 0 ? this.oldGardenUps : await this.userSrv.getUserUps('old-garden');

        return (this.oldGardenTab = true);
    }
  }

  ngAfterViewInit(): void {

    const customEventData = {
      cf_page_title: TrackingConstants.GTM4.CF_PAGE_TITLE.ACCOUNT_MY_GARDEN,
      page_type: TrackingConstants.GTM4.PAGE_TYPE.MY_ACCOUNT,
      language: this.langSrv.getCurrentLang(),
      country_delivery: this.countrySrv.getCurrentCountry()?.iso
    };

    this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.PAGE_VIEW, false, customEventData);
  }
}
