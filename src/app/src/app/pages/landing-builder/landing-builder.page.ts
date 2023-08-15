import { Component, Injector, ViewChild, ViewContainerRef, AfterViewInit, Renderer2, HostListener, OnDestroy } from '@angular/core';
import { BasePage } from '@pages/base';
import { LandingsService } from '@services/landing';
import { FeedbackBlockComponent } from '@components/home/feedback-block/feedback-block.component';
import { LandingAgroupmentComponent } from '@app/modules/landing/components/landing-agroupment/landing-agroupment.component';
import { CountersComponent } from '@components/home/counters/counters.component';
import { NewsletterBlockComponent } from '@components/home/newsletter-block/newsletter-block.component';
import { LandingTitleComponent } from '@modules/landing/components/landing-title/landing-title.component';
import { LandingStepsBlockComponent } from '@modules/landing/components/landing-steps-block/landing-steps-block.component';
import { LandingFaqComponent } from '@modules/landing/components/landing-faq/landing-faq.component';
import { LandingVideoPlayerComponent } from '@modules/landing/components/landing-video-player/landing-video-player.component';
import { LandingTextImageComponent } from '@modules/landing/components/landing-text-image/landing-text-image.component';
import { NoContentPageComponent } from '@pages/no-content';
import { TranslocoService } from '@ngneat/transloco';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { ModuleInfo } from '@app/interfaces/landing';
import { BlockType } from '../../constants/landing.constants';
import { FavouriteService } from '../../services';

const NUMBER_OF_BLOCKS_TO_LAZY_LOAD = 3;

@Component({
  selector: 'landing-builder',
  template: '<ng-template #LandingFactory></ng-template>',
})
export class LandingBuilderComponent extends BasePage implements AfterViewInit, OnDestroy {
  @ViewChild('LandingFactory', { read: ViewContainerRef }) landingRef;
  public languageSubscription: Subscription;
  public countrySubscription: Subscription;
  public currentLang: string;
  public landing: any;
  public modules = {
    header: LandingTextImageComponent,
    pointImage: LandingStepsBlockComponent,
    agroupment: LandingAgroupmentComponent,
    titleAndSubtitle: LandingTitleComponent,
    quote: FeedbackBlockComponent,
    faq: LandingFaqComponent,
    video: LandingVideoPlayerComponent,
    textAndImage: LandingTextImageComponent,
    text: LandingTitleComponent,
    counter: CountersComponent,
    newsletterForm: NewsletterBlockComponent,
  };
  private numberOfLoadedModules = 0;
  private landingBlocksLength = 0;
  private agroupmentPromises = [];

  destroy$ = new Subject<void>();

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    if (this.numberOfLoadedModules < this.landingBlocksLength) {
      this.buildDynamicLazyLoading();
    }
  }

  constructor(
    public injector: Injector,
    private landingSrv: LandingsService,
    private renderer2: Renderer2,
    public translocoSrv: TranslocoService,
    public favouriteSrv: FavouriteService
  ) {
    super(injector);
    this.setLoading(true);
    this.setInnerLoader(true, true);
    this.landingSrv.init();
  }

  ngAfterViewInit(): void {
    this.route.params.subscribe(async (params) => {
      this.currentLang = this.langSrv.getCurrentLang();
      if (!this.landing) {
        this.landing = await this.landingSrv.getLandingById(params.landingId);
        this.landingBlocksLength = Object.values(this.landing.blocks).flat().length;
        this.landing?.name && this.handleContent();
        this.landingSrv.setCurrentLandingEnglishCode(this.landing?.slug?.en);
      }
    });

    void this.favouriteSrv.setCrowdfarmer();
  }

  public handleContent(): void {
    const currentRoute = this.routerSrv.getPath().split('/')[2];

    if ((currentRoute === 'product' && this.landing.draft) || (this.routerSrv.getIsLandingDraft() && !this.landing.draft)) {
      this.landingRef.createComponent(NoContentPageComponent);
    } else {
      this.setSeoData(currentRoute);
      this.setLoading(false);
      this.setInnerLoader(false, false);
      for (let i = 1; i <= NUMBER_OF_BLOCKS_TO_LAZY_LOAD; i++) {
        this.buildFactoryComponent(i);
      }
    }
  }

  private buildDynamicLazyLoading(): void {
    const { blockType, index } = this.getModuleInfoByPosition(this.numberOfLoadedModules);
    const elementId = `${blockType}_` + index;

    if (this.isElementVisible(elementId)) {
      this.buildFactoryComponent(this.numberOfLoadedModules + 1);
    }
  }

  private setSeoData(currentRoute: string): void {
    const seoData = {
      title: this.translocoSrv.translate(this.landing.metaDescription.lokaliseKey),
      description: this.translocoSrv.translate(this.landing?.metaDescription?.lokaliseKey),
      og: {
        title: this.translocoSrv.translate(this.landing?.metaTitle?.lokaliseKey),
        description: this.translocoSrv.translate(this.landing?.metaDescription?.lokaliseKey),
        ...(this.landing?.designImage && { image: this.landing.designImage }),
      },
    };

    seoData?.title && this.seoSrv.set(currentRoute, seoData);
  }

  private buildFactoryComponent(position: number): void {
    const { blockType, module } = this.getModuleInfoByPosition(position);
    const moduleContent = this.landingSrv.setContentModule(module, blockType);
    const waveColor = this.getWaveColor(position);
    const componentRef = this.landingRef.createComponent(this.modules[blockType]);

    componentRef.location.nativeElement.id = `${blockType}_${position}`;
    moduleContent && Object.keys(moduleContent).map(a => {
      componentRef.instance[a] = moduleContent[a];
      waveColor && this.renderer2.addClass(componentRef.location.nativeElement, waveColor);
      this.landingBlocksLength === position && this.renderer2.addClass(componentRef.location.nativeElement, 'lastElement');
    });
    // Check if module has cta
    (blockType === BlockType.HEADER || blockType === BlockType.AGROUPMENT) && this.handleScroll(componentRef);
    componentRef.changeDetectorRef.detectChanges();

    if (blockType === BlockType.VIDEO || blockType === BlockType.AGROUPMENT) {
      this.languageSubscription = this.langSrv.getCurrent().subscribe((lang) => {
        blockType === BlockType.VIDEO && this.handleVideoURI(componentRef, blockType, module, lang);
        blockType === BlockType.AGROUPMENT && (componentRef.instance.inheritedLang = lang);
      });
    }

    this.numberOfLoadedModules++;
  }

  private handleVideoURI(componentRef: any, moduleName: string, currentModule: any, lang: string): void {
    const moduleContent = this.landingSrv.setContentModule(currentModule, moduleName, lang);

    moduleContent && Object.keys(moduleContent).map((a) => (componentRef.instance[a] = moduleContent[a]));
  }

  private setAnchorLink(position: number): string {
    const blocks = this.landing.blocks;
    let block: any;
    let blockType: string;

    for ([blockType, block] of Object.entries(blocks)) {
      for (const [index, module] of block.entries()) {
        if (parseInt(module.position) === position) {
          return `#${blockType}_${position}`;
        }
      }
    }
  }

  private handleScroll(componentRef: any): void {
    const link = parseInt(componentRef.instance.info.button.link) + 1;
    const idElementToScroll = this.setAnchorLink(link);

    componentRef?.instance?.scrollSubject$?.pipe(takeUntil(this.destroy$)).subscribe(() => {
      let isElementLoaded = this.domSrv.getElement(idElementToScroll);

      !isElementLoaded && this.loadAllComponentsUntilPosition(link);
      isElementLoaded = this.domSrv.getElement(idElementToScroll);
      void (isElementLoaded && Promise.all(this.agroupmentPromises).then(() => this.domSrv.scrollTo(idElementToScroll)));
    });
  }

  loadAllComponentsUntilPosition(position: number): void {
    for (let i = this.numberOfLoadedModules + 1; i <= position; i++) {
      this.buildFactoryComponent(i);
    }
  }

  private getWaveColor(position: number): string {
    const isOdd = !!(position % 2);
    let waveColor;

    if (isOdd) {
      return '';
    }

    this.isLightWave(position) ? (waveColor = 'light-wave') : (waveColor = 'dark-wave');

    return waveColor;
  }

  private isLightWave(position: number): boolean {
    return !!((position / 2) % 2);
  }

  public isElementVisible(id: string): boolean {
    return this.domSrv.scrollUnderOverElement(`#${id}`, 80, false, false, false);
  }

  private getModuleInfoByPosition(position: number): ModuleInfo {
    const blocks = this.landing.blocks;
    let block: any;
    let blockType: string;

    for ([blockType, block] of Object.entries(blocks)) {
      for (const [index, module] of block.entries()) {
        if (module.position === position) {
          return { blockType, module, index: module.position };
        }
      }
    }

    return { blockType: null, module: null, index: null };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.languageSubscription?.unsubscribe();
    this.countrySubscription?.unsubscribe();
  }
}
