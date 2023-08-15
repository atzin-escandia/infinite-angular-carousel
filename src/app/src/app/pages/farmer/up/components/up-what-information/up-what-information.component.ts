import { Component, Injector, Input, ViewEncapsulation, OnChanges } from '@angular/core';
import { CompleteSeals } from '@app/interfaces';
import { BaseComponent } from '@components/base';

@Component({
  selector: 'up-what-information',
  templateUrl: './up-what-information.component.html',
  styleUrls: ['./up-what-information.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UpWhatInformationComponent extends BaseComponent implements OnChanges {
  @Input() infoBlock: any = {};
  @Input() seals: CompleteSeals = {
    header: [],
    detailHeader: [],
    official: [],
    unOfficial: [],
  };
  @Input() categoryPicture: any;
  @Input() blockName: string;
  @Input() shownCalendar: boolean;
  @Input() upInformationReplacements: any;

  public picturesURLs: any;
  public unfold = false;
  public faqsBlock = [];
  public whyAdoptTexts = [
    {
      text: 'learn who produces your food',
      icon: 'eva eva-bulb-outline'
    },
    {
      text: 'buy directly from farmer',
      icon: 'cf-icon-farmer'
    },
    {
      text: 'plan ahead',
      icon: 'eva eva-calendar-outline'
    },
    {
      text: 'reward the farmer',
      icon: 'eva eva-award-outline'
    }
  ];
  constructor(public injector: Injector) {
    super(injector);
  }

  ngOnChanges(): void {
    if (this.infoBlock && this.blockName) {
      if (this.infoBlock.whatReceiveProducts && this.faqsBlock.length === 0) {
        for (const faq of this.infoBlock.whatReceiveProducts) {
          this.faqsBlock.push({
            question: this.textSrv.markdown(
              this.textSrv.replaceAll(faq._m_header[this.langSrv.getCurrentLang()], this.upInformationReplacements)
            ),
            answer: this.textSrv.markdown(this.textSrv.replaceAll(
              faq._m_description[this.langSrv.getCurrentLang()], this.upInformationReplacements)
            )
          });
        }
      }

      switch (this.blockName) {
        case 'theProject':
          this.picturesURLs = this.infoBlock.informationProjectPicture || [];
          break;
        case 'whatAdopt':
          this.picturesURLs = this.infoBlock.informationAdoptionPicture || [];
          break;
        case 'whatReceive':
          this.picturesURLs = this.infoBlock.informationProductPicture || [];
          break;
      }
    }
  }

  public unfoldText(): void {
    this.unfold = !this.unfold;
    if (!this.unfold) {
      this.domSrv.scrollToElmWithHeader('#' + this.utilsSrv.fromCamelCaseToDased(this.blockName), 100);
    }
  }
}
