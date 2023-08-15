import { Component, OnInit, Injector, HostBinding, OnDestroy, AfterViewInit } from '@angular/core';
import { BasePage } from '@app/pages';
import {
  UserService,
  LangService,
  TextService,
  AuthService,
  EventService,
  CartsService,
  UpService,
  F2bService,
  TrackingService,
  TrackingConstants,
} from '@app/services';
import { PopupService } from '@services/popup';
import { ChangePasswordPopupComponent } from '../../../popups/change-password';
import { StatusPopupComponent } from '@popups/status-popup';
import { ICountry } from '@app/interfaces';
import { Subscription } from 'rxjs';

@Component({
  selector: 'info-page',
  templateUrl: './info.page.html',
  styleUrls: ['./info.page.scss'],
})
export class InfoPageComponent extends BasePage implements OnInit, AfterViewInit, OnDestroy {
  @HostBinding('class') classes = 'col-12';

  public categories: any;
  public infoSections: any = ['Personal info', 'Manage your info'];
  public currentSection = 'Personal info';
  public countriesPrefix: ICountry[];
  private changePassPopupCloseSubscription: Subscription;

  constructor(
    public injector: Injector,
    public langSrv: LangService,
    public textSrv: TextService,
    private upSrv: UpService,
    public authSrv: AuthService,
    public popupSrv: PopupService,
    public userSrv: UserService,
    public eventSrv: EventService,
    private cartSrv: CartsService,
    private f2bSrv: F2bService,
    private trackingSrv: TrackingService,
  ) {
    super(injector);
  }

  async ngOnInit(): Promise<void> {
    // It forces to load the user information and refreshes page when this component is launched.
    await this.loadUser(true);

    // Listens to private zone components to notice which one is open
    this.eventSrv.dispatchEvent('private-zone-url', { router: this.routerSrv.getPath(), content: 1 });

    await this.checkPath();

    this.categories = await this.upSrv.getCategories();
    this.countriesPrefix = await this.countrySrv.get();

    this.domSrv.addListener('window', 'private-zone-route', this.backToPersonalInfo.bind(this));
    this.setLoading(false);
    this.setInnerLoader(false, false);
  }

  ngOnDestroy(): void {
    this.changePassPopupCloseSubscription?.unsubscribe();
  }

  public async updateCategories(data: any): Promise<void> {
    try {
      const updatedUser = await this.userService.updateUserInfo(data.user);

      if (updatedUser) {
        this.openStatusPopup('interests updated');
      }
    } catch (error) {
      this.openStatusPopup('error on the action', error);
    }
  }

  public async updateSubscription(user: any): Promise<void> {
    try {
      const updatedSubcription = await this.userService.updateUserNewsletterSubscription(user._id);

      if (updatedSubcription) {
        this.openStatusPopup('interests updated');
      }
    } catch (error) {
      this.openStatusPopup('error on the action', error);
    }
  }

  public toggleInfoPage(e: any): void {
    this.currentSection = this.infoSections[e];
  }

  public backToPersonalInfo(): void {
    this.currentSection = 'Personal info';
  }

  private async checkPath(): Promise<void> {
    if (this.routerSrv.getPath().includes('newsletter')) {
      this.toggleInfoPage(1);
    }

    if (this.routerSrv.getPath().includes('password')) {
      const companyQuery = this.route.snapshot.queryParams.company;
      const companyLogo = companyQuery ? await this.getCompanyLogo(companyQuery) : '';

      this.openChangePasswordPopup(companyLogo);
    }
  }

  private openChangePasswordPopup(companyLogo: string): void {
    const changePassPopup = this.popupSrv.open(ChangePasswordPopupComponent, {
      data: {
        isAutoLogin: true,
        company: companyLogo,
      },
    });

    this.onCloseChangePasswordPopup(changePassPopup);
  }

  private onCloseChangePasswordPopup(changePassPopup: any): void {
    this.changePassPopupCloseSubscription = changePassPopup.onClose.subscribe((result) => {
      if (result) {
        this.openStatusPopup('Password successfuly updated');

        if (this.cartSrv.get()?.length) {
          this.routerSrv.navigateToOrderSection('cart');
        }
      }
    });
  }

  private openStatusPopup(msgSuccess: string, err?: any): void {
    this.popupSrv.open(StatusPopupComponent, {
      data: {
        msgSuccess,
        err,
      },
    });
  }

  private async getCompanyLogo(companyName: string): Promise<string> {
    try {
      const company = await this.f2bSrv.getCompanyBySlug(companyName);

      return company?.logo || '';
    } catch (err) {
      this.loggerSrv.log('Service error');
    }
  }

  ngAfterViewInit(): void {
    const customEventData = {
      cf_page_title: TrackingConstants.GTM4.CF_PAGE_TITLE.ACCOUNT_MY_PROFILE,
      page_type: TrackingConstants.GTM4.PAGE_TYPE.MY_ACCOUNT,
      language: this.langSrv.getCurrentLang(),
      country_delivery: this.countrySrv.getCurrentCountry()?.iso
    };

    this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.PAGE_VIEW, false, customEventData);
  }
}
