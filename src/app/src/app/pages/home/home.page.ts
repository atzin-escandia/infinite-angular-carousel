import { AfterViewInit, Component, HostListener, Injector, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { BlogResource } from '@app/resources';
import { CountryService, FavouriteService, FeedbackService, TrackingConstants, TrackingService } from '@app/services';
import { Observable, Subject, Subscription, switchMap, tap } from 'rxjs';
import { BasePage } from '../base';
import { OVERHARVEST_SUFFIX } from '../farmer/overharvest/constants/overharvest.constants';
import { SlidesInfo } from '@interfaces/slides';
import { HomeService } from '@services/home/home.service';
import { AcceleratorInfo } from '@interfaces/accelerators';

@Component({
  selector: 'home-page',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HomePageComponent extends BasePage implements OnInit, OnDestroy, AfterViewInit {
  feedbacks = [];
  feedbacksLoaded = false;
  countrySubscription: Subscription;
  popoverListenerToBeLaunched = true;
  popoverSubscription: Subscription;
  routerSubscription: Subscription;
  loadCounters = false;
  loadMediaLogos = false;
  animateAccelerators: boolean;
  accelerators = false;
  blogPosts = [];
  blogModuleLoaded = false;
  fixed = false;
  currLang: string;
  langSubs: Subscription;
  isMobile: boolean;
  currentCountry: string;
  newHome = true;

  scrollSubject$ = new Subject<void>();

  destroy$ = new Subject<void>();
  acceleratorsSubject$ = new Subject<void>();
  accelerators$: Observable<AcceleratorInfo[]> = this.acceleratorsSubject$.pipe(switchMap(() => this.homeSrv.getAccelerators()));

  isLoadingSlide = true;
  slidesSubject$ = new Subject<void>();
  slides$: Observable<SlidesInfo[]> = this.slidesSubject$.pipe(
    switchMap(() => this.homeSrv.getHeroSlides()),
    tap(() => {
      this.isLoadingSlide = false;
    })
  );

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    this.loadSubscribePopOver();
    this.loadCounters = this.isElementVisible(this.newHome ? '#farmers-block' : '#market-cards-block');
    this.loadMediaLogos = this.isElementVisible('#blog-posts-block');
    this.accelerators = this.isElementVisible('#search');
    void this.checkLoadFeedbacks();
    this.checkLoadBlogModule(this.currLang);
    this.animateAccelerators = this.isHeroVisible('#hero-block');
  }

  constructor(
    public injector: Injector,
    private feedbacksSrv: FeedbackService,
    private trackingSrv: TrackingService,
    private blogRsc: BlogResource,
    public countrySrv: CountryService,
    public favouriteSrv: FavouriteService,
    public homeSrv: HomeService
  ) {
    super(injector);
  }

  isHeroVisible(selector: string): boolean {
    const element = document.querySelector(selector);

    if (element) {
      const rect = element.getBoundingClientRect();

      return rect.top > -300;
    }

    return false;
  }

  ngOnInit(): void {
    this.currentCountry = this.countrySrv.getCountry();
    this.isMobile = this.domSrv.getIsDeviceSize();
    this.currLang = this.langSrv.getCurrentLang();
    this.langSubs = this.langSrv.getCurrent().subscribe((lang) => {
      this.currLang = lang;
      this.blogModuleLoaded = false;
    });

    this.setLoading(false);
    this.setInnerLoader(false, false);

    let isSubscribePopoverOpen = false;

    this.popoverSubscription = this.popoverSrv.getIfShowSubscribeNewsletter().subscribe((e) => {
      if (e === true && !isSubscribePopoverOpen) {
        isSubscribePopoverOpen = true;
        this.trackingSrv.trackEvent(TrackingConstants.GTM.EVENTS.OPEN_NEWSLETTER);
        this.popoverSrv.open('SubscribePopoverComponent', 'header-container', {
          inputs: {},
          outputs: {
            onClose: (element) => {
              this.popoverSrv.setIfShowSubscribeNewsletter(element);
              this.storageSrv.set('visitsCounter', this.storageSrv.get('visitsCounter') + 1);
              this.popoverSrv.close('SubscribePopoverComponent');
              isSubscribePopoverOpen = false;
            },
          },
        });
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.getPath() && this.getPath().includes(OVERHARVEST_SUFFIX)) {
      this.domSrv.scrollTo('#promo-block');
    }

    const customEventData = {
      cf_page_title: TrackingConstants.GTM4.CF_PAGE_TITLE.HOME,
      page_type: TrackingConstants.GTM4.PAGE_TYPE.HOME,
      language: this.langSrv.getCurrentLang(),
      country_delivery: this.countrySrv.getCurrentCountry()?.iso,
    };

    this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.PAGE_VIEW, false, customEventData);

    void this.favouriteSrv.setCrowdfarmer();

    this.domSrv.scrollSubject$.next();
    this.slidesSubject$.next();
    this.acceleratorsSubject$.next();
  }

  ngOnDestroy(): void {
    this.popoverSrv.setIfShowSubscribeNewsletter(true);
    this.popoverSubscription.unsubscribe();
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.langSubs) {
      this.langSubs.unsubscribe();
    }
  }

  isElementVisible(id: string): boolean {
    return this.domSrv.scrollUnderOverElement(id, 80, false, false, false);
  }

  // Search bar
  search(searchTerm: string): void {
    searchTerm !== '' && this.routerSrv.navigate('search', null, { q: searchTerm, tab: 'all' });
  }

  /**
   * load feedback when farmers block is on screen
   */
  async checkLoadFeedbacks(): Promise<void> {
    if (this.domSrv.isElementVisible('#farmers-block')) {
      if (this.feedbacksLoaded) {
        return;
      } else {
        this.feedbacksLoaded = true;
        this.feedbacks = await this.feedbacksSrv.get();
      }
    }
  }

  /**
   * load blog module when promo block is on screen
   */
  checkLoadBlogModule(lang: string): void {
    if (!this.blogModuleLoaded) {
      this.blogModuleLoaded = true;
      this.blogRsc
        .getPosts(lang)
        .then((blogBody) => {
          this.blogPosts = blogBody;
        })
        .catch(() => {
          this.blogPosts = [];
        });
    }
  }

  loadSubscribePopOver(): void {
    if (this.popoverListenerToBeLaunched) {
      this.popoverSrv.setIfShowSubscribeNewsletter();
      this.popoverListenerToBeLaunched = false;
    }
  }
}
