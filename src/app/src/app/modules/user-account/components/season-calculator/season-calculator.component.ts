import { Component, OnInit, Injector, Input } from '@angular/core';
import { BaseComponent } from '@app/components';
import { PricesService } from '@app/services';

@Component({
  selector: 'season-calculator',
  templateUrl: './season-calculator.component.html'
})
export class SeasonCalculatorComponent extends BaseComponent implements OnInit {
  public countryArr: any;
  public countriesByIso: any;
  public country: string;
  public up: any;
  public upCf: any;
  public numberOfBoxes: number;
  public masterBoxLeft: number;
  public maxNumOfBoxes: number;

  public price: any;

  @Input() public data: any;

  constructor(public injector: Injector, public priceSrv: PricesService) {
    super(injector);
  }

  ngOnInit(): void {
    if (this.data) {
      const data = this.data;

      this.up = data.up;

      if (data.upCf) {
        this.upCf = data.upCf;
      }

      this.countriesByIso = data.countriesByIso;
      /// Country selector
      this.countryArr = [];

      this.countriesByIso.map((countryObj: any) => {
        this.countryArr.push(countryObj.iso);
      });

      this.country = data.country ? data.country : this.countryArr[0];

      // Calculate price
      this.numberOfBoxes = data.masterBoxReserved - data.upCf.stepMSUsed;
      this.price = data.boxPrices;
      if (data.status.outOfSeason && data.status.renewOpen) {
        this.maxNumOfBoxes = data.up.maxStepMS;
      } else {
        this.maxNumOfBoxes = data.upCf.stepMSReserved - data.upCf.stepMSUsed;
      }

      this.boxesLeft();
    }
  }

  /**
   * Calculate master boxes left
   *
   */
  private boxesLeft(): void {
    const stepMSRefunded = this.upCf.stepMSRefunded ? this.upCf.stepMSRefunded : 0;

    this.masterBoxLeft = this.upCf.stepMSReserved
      ? this.upCf.stepMSReserved - this.upCf.stepMSUsed - stepMSRefunded
      : (this.upCf.umsReserved - this.upCf.umsUsed) / this.up.masterUnitsStep;
  }

  /**
   * Change and updates ums value, then recalcultes price
   *
   * @param step 1 | -1
   */
  public addSubsctractUms(step: number): void {
    this.numberOfBoxes = this.numberOfBoxes + step;
  }

  // Country Changed
  public async countryChanged(country: string): Promise<void> {
    this.price = await this.priceSrv.get(this.up, country, 'MULTI_SHOT_ADOPTION', this.numberOfBoxes);
  }
}
