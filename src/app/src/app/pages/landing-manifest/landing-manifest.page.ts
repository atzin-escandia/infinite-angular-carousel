import { Component, OnInit, Injector, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { BasePage } from '../base';
import { AuthService, TrackingConstants, TrackingService } from '../../services';
@Component({
  selector: 'landing-manifest-page',
  templateUrl: './landing-manifest.page.html',
  styleUrls: ['./landing-manifest.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LandingManifestComponent extends BasePage implements OnInit, AfterViewInit {
  public introAnimation = {
    path: 'assets/lottie/intro.json',
    loop: false
  };
  public disintermediateAnimation = { path: 'assets/lottie/disintermediate.json' };
  public supermarketAnimation1 = { path: 'assets/lottie/supermarket1.json' };
  public supermarketAnimation2 = { path: 'assets/lottie/supermarket2.json' };
  public winnerAnimation = {
    path: this.domSrv.getIsDeviceSize() ? 'assets/lottie/winner-mbl.json' : 'assets/lottie/winner-dkt.json',
  };
  public loversAnimation1 = { path: 'assets/lottie/lovers1.json' };
  public loversAnimation2 = { path: 'assets/lottie/lovers2.json' };
  public politicallyIncorrectAnimation = { path: 'assets/lottie/politically-incorrect.json' };
  public valuesBraveryAnimation = { path: 'assets/lottie/values-bravery.json' };
  public valuesHumanityAnimation = { path: 'assets/lottie/values-humanity.json' };
  public valuesInnovationAnimation = { path: 'assets/lottie/values-innovation.json' };
  public valuesSustainabilityAnimation = { path: 'assets/lottie/values-sustainability.json' };
  public multilocalAnimation = { path: 'assets/lottie/multilocal.json' };
  public mistakesAnimation = { path: 'assets/lottie/mistakes.json' };

  public founders = [
    {
      name: 'Juliette Simonin',
      picture: 'https://common.crowdfarming.com/uploaded-images/1612884444608-3eb52b27-201f-4afc-9737-1cb291c81bf9.svg'
    },
    {
      name: 'Gonzalo Úrculo',
      picture: 'https://common.crowdfarming.com/uploaded-images/1612884536784-15851726-9051-4960-b389-4bfaac606b2d.svg'
    },
     {
      name: 'Gabriel Úrculo',
      picture: 'https://common.crowdfarming.com/uploaded-images/1612951344023-84e04db3-17f8-4ef8-9b99-48631a2afd82.svg'
    },
    {
      name: 'Moisés Calviño',
      picture: 'https://common.crowdfarming.com/uploaded-images/1612951364327-a3393947-38b6-4f7c-ae7d-9e3043800857.svg'
    }
  ];

  public values = [
    {
      id: 'bravery',
      name: 'Bravery',
      background: 'https://common.crowdfarming.com/uploaded-images/1612970048711-5ca46631-6030-4d9c-8e73-f6455dde7257.svg',
      backgroundActive: 'https://common.crowdfarming.com/uploaded-images/1612968117638-e38e5f53-1ebb-4206-9168-9259a9b83bd5.svg'
    },
    {
      id: 'humanity',
      name: 'Humanity',
      background: 'https://common.crowdfarming.com/uploaded-images/1612970064345-8e62ff69-1f5c-4616-bdd0-e9b0ad71b70e.svg',
      backgroundActive: 'https://common.crowdfarming.com/uploaded-images/1612968303850-10e83634-0080-4f20-a434-338d54e47eab.svg'
    },
    {
      id: 'innovation',
      name: 'Innovation',
      background: 'https://common.crowdfarming.com/uploaded-images/1612970081913-7240a4ad-79fb-4b6f-a319-7d816be20da5.svg',
      backgroundActive: 'https://common.crowdfarming.com/uploaded-images/1612968319142-2d4fd1e0-d4ed-44f4-b997-702489fa9200.svg'
    },
    {
      id: 'sustainability',
      name: 'Sustainability',
      background: 'https://common.crowdfarming.com/uploaded-images/1612970094823-4d7fa061-3108-4171-b4a1-eaf30470d428.svg',
      backgroundActive: 'https://common.crowdfarming.com/uploaded-images/1612968337533-c76e9f1d-a0e6-4563-8ced-5fc73d7552a5.svg'
    }
  ];

  public selectedTab = 'bravery';
  public outerContentValues: any;
  public outerContentMultilocal: any;
  public innerContentMultilocal: any;
  public contentCenterMultilocal: number;

  constructor(
    public injector: Injector,
    public authSrv: AuthService,
    private trackingSrv: TrackingService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    if (this.app) {
      this.domSrv.showHeader(false);
      this.domSrv.showFooter(false);
    }

    this.setLoading(false);
    this.setInnerLoader(false, false);

    this.outerContentValues = this.domSrv.getElement('#manifest-section_values');
    this.centerContentMobile(this.outerContentValues, 70);

    this.outerContentMultilocal = this.domSrv.getElement('#manifest-section_multilocal');
    this.innerContentMultilocal = this.domSrv.getElement('#manifest-section_multilocal .center-content');
    this.contentCenterMultilocal = (this.innerContentMultilocal.clientWidth - this.outerContentMultilocal.clientWidth) / 2;
    this.centerContentMobile(this.outerContentMultilocal, this.contentCenterMultilocal);
  }

  flipCard(id: string): void {
    const currentCard = this.domSrv.getElement(`#${id}`);

    currentCard.classList.toggle('flipped');
  }

  centerContentMobile(outer: any, contentCenter: number): void {
    outer.scrollLeft = contentCenter;
  }

  ngAfterViewInit(): void {
    const customEventData = {
      cf_page_title: TrackingConstants.GTM4.CF_PAGE_TITLE.MANIFESTO,
      page_type: TrackingConstants.GTM4.PAGE_TYPE.MANIFESTO,
      language: this.langSrv.getCurrentLang(),
      country_delivery: this.countrySrv.getCurrentCountry()?.iso
    };

    this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.PAGE_VIEW, false, customEventData);
  }
}
