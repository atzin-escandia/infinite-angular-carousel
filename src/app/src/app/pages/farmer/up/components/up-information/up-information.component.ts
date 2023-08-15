import { Component, Injector, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from '@components/base';
import { CostsCalculatorPopupComponent } from '../../popups/costs-calculator-popup';
import { UpService } from '@services/up/up.service';
import { Subscription } from 'rxjs';
import { CompleteSeals } from '@app/interfaces';

@Component({
  selector: 'up-information',
  templateUrl: './up-information.component.html',
  styleUrls: ['./up-information.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class UpInformationComponent extends BaseComponent implements OnInit, OnDestroy {
  @Input() availableDates: any = {};
  @Input() up: any = {};
  @Input() upInformationReplacements: any;
  @Input() seals: CompleteSeals = {
    header: [],
    detailHeader: [],
    official: [],
    unOfficial: [],
  };
  @Input() selectedCountry: string;
  @Input() availableCountriesByISO: any;
  @Input() price: any;
  @Input() categoryVideos: any;

  private langSubscription: Subscription;
  public videoId: string;

  public infoSections: any = [
    'theProject',
    'whatAdopt',
    'whatReceive',
    'whenReceiveIt',
    'whyAdopt',
  ];
  public whyAdoptTexts = [
    'learn who produces your food',
    'buy directly from farmer',
    'plan ahead',
    'reward the farmer',
  ];
  constructor(public injector: Injector, public upSrv: UpService) {
    super(injector);
  }

  ngOnInit(): void {
    if (this.categoryVideos) {
      this.videoId = this.langSrv.getCurrentLang() ?
        this.categoryVideos[this.langSrv.getCurrentLang()] : this.categoryVideos[this.langSrv.getDefaultLang()];

      this.langSubscription = this.langSrv.getCurrent().subscribe(lang => {
        this.videoId = lang ? this.categoryVideos[lang] : this.categoryVideos[this.langSrv.getDefaultLang()];
      });
    }
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  /**
   * Open Calculate Shipping Costs popup
   */
  public openShippingCostsCalculatorPopUp(): void {
    const shippingCostsCalculatorPopup = this.popupSrv.open(CostsCalculatorPopupComponent, {
      data: {
        close: true,
        isFullHeight: this.domSrv.getIsDeviceSize(),
        availableCountriesByISO: this.availableCountriesByISO,
        location: this.selectedCountry,
        weight: this.up.masterBoxes[0].weight,
        weightUnit: this.up.masterBoxes[0].weightUnit,
        numberOfBoxes: 1,
        minStepMS: this.up.minStepMS,
        maxStepMS: this.up.maxStepMS,
        isMultishot: this.up.sellingMethod === 'MULTI_SHOTS',
        price: this.price,
        up: this.up,
      }
    });

    const parentPopups = document.getElementsByClassName('popups')[0] as HTMLElement;

    if (parentPopups) {
      this.domSrv.addClassesAllDevices('.popups', ['cost-calculator-popups']);
    }
  }
}
