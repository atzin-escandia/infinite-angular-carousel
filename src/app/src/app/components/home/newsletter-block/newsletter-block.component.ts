import { Component, Injector, ViewEncapsulation, ChangeDetectorRef, AfterContentChecked, Input } from '@angular/core';
import { BaseComponent } from '@components/base';
import { TrackingService, LoaderService, AuthService, PromotionsService, CheckDataService } from '@app/services';

@Component({
  selector: 'home-newsletter-block',
  templateUrl: './newsletter-block.component.html',
  styleUrls: ['./newsletter-block.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NewsletterBlockComponent extends BaseComponent implements AfterContentChecked {
  @Input() spacing = false;
  @Input() imgBlock = `${this.env.domain}/assets/img/promotion-campaign/nl/nl-illustration.svg`;
  @Input() titleKey = 'page.become-crowdfarmer.body';

  public privacy: boolean;

  public crowdfarmer: any = {
    name: '',
    email: '',
  };

  public formErrors: any = {
    email: false,
    name: false,
    privacy: false,
  };

  constructor(
    private trackingSrv: TrackingService,
    public injector: Injector,
    private cdr: ChangeDetectorRef,
    public loaderSrv: LoaderService,
    public authSrv: AuthService,
    public promotionSrv: PromotionsService,
    public checkSrv: CheckDataService
  ) {
    super(injector);
  }

  // Need to prevent error
  ngAfterContentChecked(): void {
    this.cdr.detectChanges();
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
   * Clear timeout to avoid the newslettermodal appear when entering data in the newsletterBlock
   */
  public dontShowNewsletterModal(): void {
    this.popoverSrv.clearShowNewsletterTimeout();
  }

  /**
   * does soft registration
   */
  public async register(subscribe: any): Promise<void> {
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
          url: this.utilsSrv.getFullUrl(),
        },
      };
      const userRegistered = await this.authSrv.soft(sendUser);

      if (userRegistered) {
        this.storageSrv.set('softRegistered', true);
        const params: any = {
          country: userRegistered.cf.registrationInfo.ipCountry,
          limit: '4',
        };
        const promotions = await this.promotionSrv.getAdoptionPromosV2(params);
        const farmers: any[] = [];

        for (const promotion of promotions) {
          const farmer = {
            farmerName: promotion.farmer.name,
            farmerPicture: promotion.farmer.pictureURL,
            _m_upVariety: promotion.up._m_variety,
            farmerSlug: promotion.farmer.slug,
            _m_upSlug: promotion.up._m_upSlug,
          };

          farmers.push(farmer);
        }
        this.popoverSrv.open('SubscribePopoverComponent', 'header-container', {
          inputs: {
            farmers,
          },
          outputs: {
            onClose: () => {
              this.popoverSrv.close('SubscribePopoverComponent');
            },
          },
        });
        // clean form
        subscribe.reset();
        this.privacy = false;
      }
    }
  }
}
