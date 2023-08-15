import {Injectable, Injector} from '@angular/core';
import {TextService} from '../text';
import {LangService} from '../lang';
import {LandingsResource} from '../../resources/landing';
import {BLOCK_MODE} from '../../modules/landing/components/landing-text-image/constants/landing.constants';
import {YOUTUBE_ID_LENGTH} from '../../pages/farmer/constants/farmer.constants';
import {ModelContentType} from '../../constants/landing.constants';
import {BaseService} from '../base';
import {LANDING_DRAFT} from '../router/router.constants';
import {RouterService} from '../router';

@Injectable({
  providedIn: 'root',
})
export class LandingsService extends BaseService {
  currentLang: string;
  currentLandingEnglishCode: string;

  init(): void {
    this.currentLang = this.langSrv.getCurrentLang();
  }

  constructor(
    private landingsRsc: LandingsResource,
    private routerSrv: RouterService,
    public injector: Injector,
    public textSrv: TextService,
    public langSrv: LangService
  ) {
    super(injector);
  }

  getCurrentLandingEnglishCode(): string {
    return this.currentLandingEnglishCode;
  }

  setCurrentLandingEnglishCode(code: string): void {
    this.currentLandingEnglishCode = code;
  }


  async getLandingById(id: string): Promise<any> {
    return await this.landingsRsc.getLandingById(id, this.routerSrv.getIsLandingDraft() ? `/${LANDING_DRAFT}` : '');
  }

  /**
   *Build tree for factory injection
   */
  // eslint-disable-next-line max-lines-per-function
  setContentModule(moduleContent: any, moduleName: string, lang?: string): any {
    lang && (this.currentLang = lang);
    const titleSubtitle = {
      title: moduleContent?.title?.lokaliseKey,
      subtitle: moduleContent?.subtitle?.lokaliseKey,
    };

    const titleSubtitleBody = {
      ...titleSubtitle,
      body: moduleContent?.paragraph?.lokaliseKey,
    };

    const imageData = {
      url: moduleContent?.image,
      alt: moduleContent?.title?.lokaliseKey,
    };

    const content: Record<ModelContentType, any> = {
      header: {
        info: {
          header: moduleContent?.title?.lokaliseKey,
          subtitle: moduleContent?.subtitle?.lokaliseKey,
          image: imageData,
          button: {
            link: moduleContent?.moduleCTA,
            text: moduleContent?.CTAText?.lokaliseKey
          },
          URLKey: moduleContent?.URLKey,
          newTab: moduleContent?.newTab
        },
        mode: BLOCK_MODE.FULL_BLOCKS,
        isHeader: true,
      },
      pointImage: {
        cards: moduleContent[moduleName] && this.getCards(moduleContent[moduleName]),
        ...titleSubtitle,
      },
      agroupment: {
        id: moduleContent[moduleName],
        title: 'page-whats-in-season.title',
        option: moduleContent.option,
        info: {
          button: {
            link: moduleContent?.moduleCTA,
            text: moduleContent?.CTAText?.lokaliseKey
          },
          URLKey: moduleContent?.URLKey,
          newTab: moduleContent?.newTab
        },
      },
      titleAndSubtitle: {
        ...titleSubtitleBody,
      },
      text: {
        ...titleSubtitleBody,
      },
      quote: {
        feedbacks: moduleContent[moduleName] && this.getQuotes(moduleContent[moduleName]),
        asyncLoading: false,
      },
      counter: {
        counters: moduleContent[moduleName] && this.getCounters(moduleContent[moduleName]),
        title: moduleContent?.title?.lokaliseKey,
      },
      newsletterForm: {
        titleKey: moduleContent?.title?.lokaliseKey,
      },
      faq: {
        image: moduleContent?.image,
        faqs: moduleContent[moduleName] && this.getFaqs(moduleContent[moduleName]),
        title: moduleContent?.title?.lokaliseKey,
      },
      video: {
        ...titleSubtitleBody,
        sizingVideo: true,
        videoId: moduleContent?._m_videoURL?.[this.currentLang] && this.getVideoID(moduleContent?._m_videoURL?.[this.currentLang]),
        option: moduleContent.option,
      },
      textAndImage: {
        info: {
          header: moduleContent?.title?.lokaliseKey,
          subtitle: moduleContent?.subtitle?.lokaliseKey,
          paragraph: moduleContent?.paragraph?.lokaliseKey,
          image: imageData,
        },
        mode: moduleContent.option === 1 ? BLOCK_MODE.FULL_BLOCKS_INVERSE : BLOCK_MODE.FULL_BLOCKS,
      },
    };

    return content[moduleName] || {};
  }

  getVideoID(urlVideo: string): string {
    return urlVideo.slice(-YOUTUBE_ID_LENGTH);
  }

  getFaqs(content: any): { question?: string; answer?: string }[] {
    return Object.keys(content).map((a) => ({
      question: content[a].question?.lokaliseKey,
      answer: content[a].answer?.lokaliseKey,
    }));
  }

  getQuotes(content: any): any[] {
    return Object.keys(content).map((a) => ({
      highlightHome: true,
      pictureURL: content[a].image,
      title: content[a].title?.lokaliseKey,
      text: content[a].quote?.lokaliseKey,
      name: content[a].name?.lokaliseKey,
      _m_text: { [this.currentLang]: content[a].quote?.lokaliseKey },
    }));
  }

  getCounters(content: any): { img: string; title?: string; text?: string; counter?: string }[] {
    return Object.keys(content).map((a) => ({
      img: content[a].image,
      title: content[a].title?.lokaliseKey,
      text: content[a].paragraph?.lokaliseKey,
      counter: content[a].paragraph?.lokaliseKey,
    }));
  }

  getCards(content: any): { img: string; title?: string; subtitle?: string }[] {
    return Object.keys(content).map((a) => ({
      img: content[a]?.image,
      title: content[a].title?.lokaliseKey,
      subtitle: content[a].paragraph?.lokaliseKey,
    }));
  }
}
