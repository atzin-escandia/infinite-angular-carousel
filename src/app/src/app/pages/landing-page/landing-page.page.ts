import { Component, OnInit, Injector, OnDestroy } from '@angular/core';
import { BasePage } from '../base';
import { AuthService, PromotionsService, TrackingService, TrackingConstants } from '../../services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'landing-page',
  templateUrl: './landing-page.page.html',
  styleUrls: ['./landing-page.page.scss'],
})
export class LandingPageComponent extends BasePage implements OnInit, OnDestroy {
  private langSubs: Subscription;
  public currentLang: string;
  public landing: any;
  public videoURL: string;
  public deskScreenshots: any;
  public mobileScreenshots: any;
  public paramSubscrip: Subscription;

  constructor(
    public injector: Injector,
    public authSrv: AuthService,
    public trackingSrv: TrackingService,
    private promoSrv: PromotionsService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.paramSubscrip = this.route.params.subscribe(async (params) => {
      this.landing = await this.promoSrv.getLanding(params.action);
      this.currentLang = this.langSrv.getCurrentLang();

      // Seo Data
      const seoData: any = {
        title: this.landing._m_metaTitle[this.currentLang],
        description: this.landing._m_metaDescription[this.currentLang],
        og: {
          title: this.landing._m_metaTitle[this.currentLang],
          description: this.landing._m_metaDescription[this.currentLang],
        },
      };

      if (this.landing.imageSeo) {
        seoData.og.image = this.landing.imageSeo;
      }
      this.seoSrv.set(params.action, seoData);

      this.deskScreenshots = [];
      this.mobileScreenshots = [];

      for (const screenShot of this.landing.feedbacks) {
        if (screenShot.lang === this.currentLang && !screenShot.mobile) {
          this.deskScreenshots.push(screenShot);
        } else if (screenShot.lang === this.currentLang && screenShot.mobile) {
          this.mobileScreenshots.push(screenShot);
        }
      }

      this.landing.promos.sort((a, b) => (a.order > b.order ? 1 : -1));

      const impressions = this.landing.promos.map((e, i) => ({
        name: e.upCode,
        list: 'LandingsMKT',
        id: e._id,
        category: e.category,
        brand: e.brandName,
        position: i + 1,
      }));

      this.trackingSrv.setInterimList('LandingsMKT');
      this.trackingSrv.trackEvent(TrackingConstants.GTM.EVENTS.IMPRESSION, true, { impressions });
    });

    this.langSubs = this.langSrv.getCurrent().subscribe((lang) => {
      this.currentLang = lang;
    });

    this.setLoading(false);
    this.setInnerLoader(false, false);
  }

  ngOnDestroy(): void {
    if (this.langSubs) {
      this.langSubs.unsubscribe();
    }
  }
}
