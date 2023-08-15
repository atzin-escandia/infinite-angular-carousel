import {Component, OnInit, Injector, OnDestroy} from '@angular/core';
import {BasePage} from '../base';
import {TrackingService} from '../../services';

@Component({
  selector: 'fruit-impact',
  templateUrl: './fruit-impact.page.html',
  styleUrls: ['./fruit-impact.page.scss']
})

export class FruitImpactPageComponent extends BasePage implements OnInit, OnDestroy {
  public firstBlockInfo: any;
  public howParticipateBlockInfo: any;
  public buyClementinesInfo: any;
  public faqsBlock: any;
  public objectives: any;
  public instagramPostList: any;

  constructor(public injector: Injector, public trackingSrv: TrackingService) {
    super(injector);
  }

  ngOnInit(): void {
    this.setLoading(false);
    this.setInnerLoader(false, false);
    this.setFirstBlockInfo();
    this.setHowParticipateBlockInfo();
    this.setBuyClementinesInfo();
    this.setFaqsBlock();
    this.setObjectives();
    this.instagramPostList = this.textSrv.getText('instagramPostList').split(',');
  }

  private setHowParticipateBlockInfo(): void {
    this.howParticipateBlockInfo = {
      header: 'header how participate',
      body: 'body how participate',
      image: this.env.domain + '/assets/img/fruitimpact/how-to/how-to-illustrator.svg',
      rightPoint: [
        {
          image: this.env.domain + '/assets/img/fruitimpact/how-to/step-1.svg',
          subHeader: '1 step',
          subBody: '1 step how participate text'
        },
        {
          image: this.env.domain + '/assets/img/fruitimpact/how-to/step-2.svg',
          subHeader: '2 step',
          subBody: '2 step how participate text'
        },
        {
          image: this.env.domain + '/assets/img/fruitimpact/how-to/step-3.svg',
          subHeader: '3 step',
          subBody: '3 step how participate text'
        }
      ]
    };
  }

  private setBuyClementinesInfo(): void {
    this.buyClementinesInfo = {
      header: 'header buyClementinesInfo',
      body: 'body buyClementinesInfo',
      image: this.env.domain + '/assets/img/fruitimpact/illustration/illustration-tote.png'
    };
  }

  private setFaqsBlock(): void {
    this.faqsBlock = {
      header: 'funding faq title',
      image: this.env.domain + '/assets/img/fruitimpact/illustration/faq-gasol.svg',
      faqs: [
        {
          question: 'page.What-objective-challenge.title',
          answer: 'page.gasol-fights-obesity.body'
        },
        {
          question: 'page.question-clementines.body',
          answer: 'page.dona-ana-farm.body'
        },
        {
          question: 'page.dona-ana-farm.body',
          answer: 'page.cloth-bag.body'
        },
        {
          question: 'page.question-box-gift.title',
          answer: 'page.insert-name-address-recipient.body'
        },
        {
          question: 'page.When-receive-box.title',
          answer: 'page.delivery-date-may-vary.body'
        }
      ]
    };
  }

  private setObjectives(): void {
    this.objectives = [
      {
        image: this.env.domain + '/assets/img/fruitimpact/illustration/objective-1-v2.svg',
        text: 'objective 1 fruitimpact'
      },
      {
        image: this.env.domain + '/assets/img/fruitimpact/illustration/objective-2-v2.svg',
        text: 'objective 2 fruitimpact'
      },
      {
        image: this.env.domain + '/assets/img/fruitimpact/illustration/objective-3-v2.svg',
        text: 'objective 3 fruitimpact'
      }
    ];
  }

  private setFirstBlockInfo(): void {
    this.firstBlockInfo = {
      preheader: '',
      preheaderImg: this.env.domain + '/assets/img/fruitimpact/illustration/icon-mandarin-v3.svg',
      header: 'header fruitimpact',
      body: 'body fruitimpact',
      image: this.env.domain + '/assets/img/fruitimpact/illustration/illustration-gasol.svg'
    };
  }

  ngOnDestroy(): void {
    this.domSrv.showHeader();
  }

  openBuyClementines(): void {
    if (window) {
      window.open(this.textSrv.getText('link landing fruitimpact'), '_blank');
    }
  }
}
