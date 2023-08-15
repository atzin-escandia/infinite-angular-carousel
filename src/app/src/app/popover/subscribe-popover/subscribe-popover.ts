import {
  Component,
  OnInit,
  Injector,
  OnDestroy,
  ViewEncapsulation,
  AfterContentChecked,
  ChangeDetectorRef,
  HostBinding
} from '@angular/core';
import {PopoverBaseComponent} from '../base/base.component';
import {
  TextService,
  UtilsService,
  AuthService,
  LangService,
  PromotionsService,
  RouterService,
  LoaderService,
  StorageService,
  CheckDataService
} from '../../services';
import {DeviceDetectorService} from 'ngx-device-detector';
import {BannerStoreService} from '../../services/banner-store';
@Component({
  selector: 'subscribe-popover',
  templateUrl: './subscribe-popover.html',
  styleUrls: ['./subscribe-popover.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SubscribePopoverComponent extends PopoverBaseComponent implements OnInit, AfterContentChecked, OnDestroy {
  @HostBinding('class.popover-is-open') isOpen;

  public privacy: any;
  public currentLang = '';
  public showTexts = false;
  public firstClick = false;
  public farmers: any = [];
  public init = false;
  public onClose: any;
  public isStoreBannerActive = false;
  public deviceInfo: any;

  public crowdfarmer: any = {
    name: '',
    email: ''
  };

  public formErrors: any = {
    email: false,
    name: false,
    privacy: false
  };

  constructor(
    public injector: Injector,
    public textSrv: TextService,
    public utilsSrv: UtilsService,
    public authSrv: AuthService,
    public langSrv: LangService,
    public promotionSrv: PromotionsService,
    private deviceService: DeviceDetectorService,
    public storageSrv: StorageService,
    public routerSrv: RouterService,
    private cdr: ChangeDetectorRef,
    public loaderSrv: LoaderService,
    public checkSrv: CheckDataService,
    private bannerStoreSrv: BannerStoreService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.currentLang = this.langSrv.getCurrentLang();
    this.deviceInfo = this.deviceService.getDeviceInfo();

    setTimeout(() => {
      if (!this.domSrv.getIsDeviceSize()) {
        this.showTexts = true;
      } else {
        this.init = true;
        this.firstClick = true;
      }
    }, 100);

    this.start({
      active: true,
      style: 'background-color: rgba(0,0,0,0);',
      close: () => this.closeWithAnimation(true)
    });

    setTimeout(() => {
      this.isOpen = true;
    }, 0);

    this.isStoreBannerActive = this.bannerStoreSrv.isVisible();
  }

  ngOnDestroy(): void {
    this.isOpen = false;
  }

  /**
   * validates email
   */
  public emailIsValid(start: boolean = false): void {
    if (start || this.formErrors.email) {
      this.formErrors.email = !this.checkSrv.emailIsValid(this.crowdfarmer.email);
    }
  }

  /**
   * validates form values minumum lenght
   */
  public minLengthIsValid(name: string, start: boolean = false): void {
    if (start || this.formErrors[name]) {
      this.formErrors[name] = this.crowdfarmer[name].length <= 1;
    }
  }

  /**
   * toggles value of privaci variable
   */
  public privacyIsValid(): void {
    this.formErrors.privacy = !this.privacy;
  }

  /**
   * makes register form overall validation
   */
  public formValid(): boolean {
    for (const err in this.formErrors) {
      if (this.formErrors[err]) {
        return false;
      }
    }

    return true;
  }

  /**
   * does soft registration and updates popup states with new content if successful
   */
  public async registerEmail(): Promise<void> {
    if (!this.firstClick) {
      this.minLengthIsValid('name', true);
      this.emailIsValid(true);
      this.privacyIsValid();
      if (this.formValid()) {
        this.loaderSrv.setLoading(true);
        const sendUser = {
          name: this.crowdfarmer.name,
          email: this.crowdfarmer.email.toLowerCase(),
          notificationLanguage: this.langSrv.getCurrentLang(),
          surnames: this.crowdfarmer.name,
          registrationInfo: {
            url: this.utilsSrv.getFullUrl()
          }
        };
        const userRegistered = await this.authSrv.soft(sendUser);

        if (userRegistered) {
          this.showTexts = false;
          const params: any = {
            country : userRegistered.cf.registrationInfo.ipCountry,
            limit: '4'
          };
          const promotions = await this.promotionSrv.getAdoptionPromosV2(params);

          for (const promotion of promotions) {
            const farmer = {
              farmerName: promotion.farmer.name,
              farmerPicture: promotion.farmer.pictureURL,
              _m_upVariety: promotion.up._m_variety,
              farmerSlug: promotion.farmer.slug,
              _m_upSlug: promotion.up._m_upSlug
            };

            this.farmers.push(farmer);
         }
          this.storageSrv.set('softRegistered', true);
        }
      }
    } else {
      this.firstClick = false;
      this.init = false;
      this.showTexts = true;
    }
  }

  /**
   * navigates to clicked farmer page and closes popover
   */
  public farmerNavigate(id: number): void {
    this.routerSrv.navigate('farmer/' + this.farmers[id].farmerSlug + '/up/' + this.farmers[id]._m_upSlug[this.currentLang]);
    this.closeWithAnimation();
  }

  // Need to prevent error
  ngAfterContentChecked(): void {
    this.cdr.detectChanges();
  }

  /**
   * Close popover
   */
  public closeWithAnimation(blockPopover: boolean = false): void {
    this.isOpen = false;

    setTimeout(() => {
      this.close();
      this.onClose(blockPopover);
    }, 300);
  }
}
