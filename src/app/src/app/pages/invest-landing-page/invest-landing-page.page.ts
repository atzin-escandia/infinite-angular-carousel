import {Component, OnInit, Injector, HostListener, ViewEncapsulation, OnDestroy} from '@angular/core';
import {BasePage} from '../base';
import {AuthService} from '../../services';
import {TranslocoService} from '@ngneat/transloco';

const CURRENT_COUNTRIES = [
  'at',
  'be',
  'bg',
  'ch',
  'cz',
  'de',
  'dk',
  'ee',
  'es',
  'fi',
  'fr',
  'gb',
  'gr',
  'hr',
  'hu',
  'ie',
  'it',
  'li',
  'lt',
  'lu',
  'lv',
  'mc',
  'mt',
  'nl',
  'no',
  'ph',
  'pl',
  'pt',
  'ro',
  'se',
  'si',
  'sk',
  'us'
];

@Component({
  selector: 'invest-landing-page',
  templateUrl: './invest-landing-page.page.html',
  styleUrls: ['./invest-landing-page.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InvestLandingPageComponent extends BasePage implements OnInit, OnDestroy {
  public user: any;
  public galleryItems: any;
  public supplyItems: any;
  public directPurchaseItems: any;
  public data: any;
  public firstBlockInfo: any;
  public secondBlockInfo: any;
  public thirdBlockInfo: any;
  public fourthBlockInfo: any;
  public inputError = false;
  public amount = 100;
  public showText = false;
  public investPopoverOpened = false;
  public btnText: string;
  public thanks: boolean;
  public sortedCountries = [];
  public mask = ['XXXXX'];
  public langSubs: any;

  @HostListener('window:scroll', ['$event'])
  onScroll(__e: Event): void {
    this.loadInvestPopOver();
  }

  constructor(
    public injector: Injector,
    public authSrv: AuthService,
    public translocoSrv: TranslocoService
  ) {
    super(injector);
  }

  async ngOnInit(): Promise<void> {
    if (this.authSrv.isLogged()) {
      this.user = await this.userService.get();
    }
    this.route.queryParams.subscribe(async query => {
      if (query.amount) {
        await this.invest(parseInt(query.amount, 10));
      }
    });

    this.thanks = false;
    const countriesByIso = await this.countrySrv.getCountriesByISO();

    for (const country in countriesByIso) {
      if (CURRENT_COUNTRIES.includes(countriesByIso[country].iso)) {
        this.sortedCountries.push(countriesByIso[country]);
      }
    }

    this.sortCountriesByName();

    this.langSubs = this.langSrv.getCurrent().subscribe(() => {
      this.sortCountriesByName();
    });

    this.btnText = 'invest in fututre button';

    this.setFirstBlockInfo();
    this.setSecondBlockInfo();
    this.setThirdBlockInfo();
    this.setFourthBlockInfo();

    this.setGalleryItems();
    this.setSupplyItems();
    this.setDirectPurchaseItems();

    this.setData();

    this.setLoading(false);
    this.setInnerLoader(false, false);
    setTimeout(() => {
      document.querySelector('#oranges').scrollLeft = 100;
    }, 100);
  }

  private setFirstBlockInfo(): void {
    this.firstBlockInfo = {
      header: 'funding title',
      subheader: 'funding subtitle',
      body: 'funding text',
      button: this.btnText,
      image: this.env.domain + '/assets/img/invest/start/00.start.illustration.svg'
    };
  }

  private setSecondBlockInfo(): void {
    this.secondBlockInfo = {
      header: 'funding history title',
      subheader: 'funding history subtitle',
      body: 'funding history text',
      image: this.env.domain + '/assets/img/invest/history/02.history.illustration.svg'
    };
  }

  private setThirdBlockInfo(): void {
    this.thirdBlockInfo = {
      header: 'funding future title',
      subheader: 'funding future subtitle',
      image: this.env.domain + '/assets/img/invest/future/08.future.illustration00.svg',
      countries: this.sortedCountries,

      nextGoals: [
        {
          image: this.env.domain + '/assets/img/invest/future/08.future.illustration02.svg',
          subHeader: 'funding future second title',
          subBody: 'funding future second subtitle'
        },
        {
          image: this.env.domain + '/assets/img/invest/future/08.future.illustration01.svg',
          subHeader: 'funding future first title',
          subBody: 'funding future first subtitle'
        },
        {
          image: this.env.domain + '/assets/img/invest/future/08.future.illustration03.svg',
          subHeader: 'funding future third title',
          subBody: 'funding future third subtitle'
        }
      ]
    };
  }

  private setFourthBlockInfo(): void {
    this.fourthBlockInfo = {
      header: 'funding faq title',
      image: this.env.domain + '/assets/img/invest/faq/11.faq.illustration.svg',
      faqs: [
        {
          question: this.translocoSrv.translate('page.benefits-pre-registration.title'),
          answer: this.translocoSrv.translate('notifications.notify-autum-project-email.body')
        },
        {
          question: this.translocoSrv.translate('page.How-much-invest.title'),
          answer: this.translocoSrv.translate('page.should-only-invest.body')
        },
        {
          question: this.translocoSrv.translate('page.What-role-investor.title'),
          answer: this.translocoSrv.translate('page.funding-faq-anwser.body')
        },
        {
          question: this.translocoSrv.translate('page.funding-faq-fourth-question.title'),
          answer: this.translocoSrv.translate('page.funding-faq-sixth2-answer.title')
        },
        {
          question: this.translocoSrv.translate('page.investment.body'),
          answer: this.translocoSrv.translate('page.doubts-ideas.body')
        },
        {
          question: this.translocoSrv.translate('page.funding-faq-sixth-question.title'),
          answer: this.translocoSrv.translate('page.funding-faq-sixth-answer.title')
        },
        {
          question: this.translocoSrv.translate('page.more-info-share-idea.text-info'),
          answer: this.translocoSrv.translate('page.doubts-ideas.body')
        }
      ]
    };
  }

  private setGalleryItems(): void {
    this.galleryItems = [
      {
        title: 'funding gallery farmer title',
        text: 'funding gallery farmer text',
        image: this.env.domain + '/assets/img/invest/gallery/03.gallery.illustration01.svg'
      },
      {
        title: 'funding gallery environment title',
        text: 'funding gallery environment text',
        image: this.env.domain + '/assets/img/invest/gallery/03.gallery.illustration02.svg'
      },
      {
        title: 'funding gallery consumer title',
        text: 'funding gallery consumer text',
        image: this.env.domain + '/assets/img/invest/gallery/03.gallery.illustration03.svg'
      }
    ];
  }

  private setSupplyItems(): void {
    this.supplyItems = [
      {
        image: this.env.domain + '/assets/img/invest/benefits/04.benefits.illustration01.svg',
        text: 'funding benefits first'
      },
      {
        image: this.env.domain + '/assets/img/invest/benefits/04.benefits.illustration02.svg',
        text: 'funding benefits second'
      },
      {
        image: this.env.domain + '/assets/img/invest/benefits/04.benefits.illustration03.svg',
        text: 'funding benefits third'
      }
    ];
  }

  private setDirectPurchaseItems(): void {
    this.directPurchaseItems = [
      {
        image: this.env.domain + '/assets/img/invest/channels/05.channels.illustration01.svg',
        subHeader: 'funding channel first title',
        subBody: 'funding channel first text'
      },
      {
        image: this.env.domain + '/assets/img/invest/channels/05.channels.illustration02.svg',
        subHeader: 'funding channel second title',
        subBody: 'funding channel second text'
      },
      {
        image: this.env.domain + '/assets/img/invest/channels/05.channels.illustration03.svg',
        subHeader: 'funding channel third title',
        subBody: 'funding channel third text'
      }
    ];
  }

  private setData(): void {
    this.data = [
      {
        rowHeader: 'funding data social title',
        rowData: [
          {
            itemData: 'funding data social first number',
            itemText: 'funding data social first text',
            itemDate: 'funding data social first subtext'
          },
          {
            itemData: 'funding data social second number',
            itemText: 'funding data social second text',
            itemDate: 'funding data social second subtext'
          },
          {
            itemData: 'funding data social third number',
            itemText: 'funding data social third text',
            itemDate: 'funding data social third subtext'
          }
        ]
      },
      {
        rowHeader: 'funding data environment title',
        rowData: [
          {
            itemData: 'funding data environment first number',
            itemText: 'funding data environment first text'
          },
          {
            itemData: 'funding data environment second number',
            itemText: 'funding data environment second text'
          }
        ]
      },

      {
        rowHeader: 'funding data selling title',
        rowData: [
          {
            itemData: 'funding data selling first number',
            itemText: 'funding data selling first text'
          },
          {
            itemData: 'funding data selling second number',
            itemText: 'funding data selling second text'
          }
        ]
      }
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubs) {
      this.langSubs.unsubscribe();
    }
  }

  public openAnswer(): void {
    this.showText = !this.showText;
  }

  public async invest(amount = this.amount): Promise<void> {
    if (amount >= 10 && amount <= 50000) {
      this.setInnerLoader(true, false);
      if (this.authSrv.isLogged()) {
        const saved = await this.userService.invest(this.user._id, amount);

        if (saved) {
          this.thanks = true;
          this.domSrv.showFooter(false);
        } else {
          this.inputError = true;
        }
      } else {
        this.routerSrv.navigate('login-register/login', null, {uri: 'crowdfunding?amount=' + amount});
      }
      this.setInnerLoader(false, false);
    } else {
      this.inputError = true;
    }
  }

  public loadInvestPopOver(): void {
    if (this.domSrv.scrollUnderOverElement('#first-quotes', 0, false) && this.domSrv.scrollUnderOverElement('#third-block', 0, true)) {
      if (!this.investPopoverOpened) {
        this.investPopoverOpened = true;
        this.popoverSrv.open('InvestPopoverComponent', 'first-quotes', {
          inputs: {
            user: this.user
          },
          outputs: {
            onClose: () => {
              this.popoverSrv.close('InvestPopoverComponent');
            }
          }
        });
      }
    } else {
      if (this.investPopoverOpened) {
        this.investPopoverOpened = false;
        this.domSrv.removeClasses('.invest-popover', ['show']);
        setTimeout(() => {
          this.popoverSrv.close('InvestPopoverComponent');
        }, 2000);
      }
    }
  }

  public sortCountriesByName(): void {
    this.sortedCountries.sort((a, b) => {
      a = a._m_name[this.langSrv.getCurrentLang()] || a._m_name.en;
      b = b._m_name[this.langSrv.getCurrentLang()] || b._m_name.en;

      return a > b ? 1 : -1;
    });
  }

  public backToHome(): void {
    this.routerSrv.navigate('/');
  }
}
