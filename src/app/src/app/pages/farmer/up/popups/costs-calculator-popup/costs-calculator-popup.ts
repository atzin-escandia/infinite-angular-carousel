import { Component, OnDestroy, OnInit } from '@angular/core';

import { PopupsInterface } from '@popups/popups.interface';
import { PopupsRef } from '@popups/popups.ref';
import { TextService } from '@services/text';
import { DomService, EventService, PricesService, UtilsService } from '@app/services';

@Component({
  selector: 'costs-calculator-popup',
  templateUrl: './costs-calculator-popup.html',
  styleUrls: ['./costs-calculator-popup.scss']
})
export class CostsCalculatorPopupComponent implements OnInit, OnDestroy {
  up: any;
  availableCountriesByISO: any = {};
  location: string;
  weightUnit: string;
  weight: number;
  numberOfBoxes: number;
  minStepMS: number;
  maxStepMS: number;
  isMultishot: boolean;
  price: any;
  pricePerKilo: number;
  crowdfarmerCurrency: any;
  onClose: any;
  showTooltip: boolean;
  displayCollapsibleContent = true;

  constructor(
    public config: PopupsInterface,
    public utilsSrv: UtilsService,
    public priceSrv: PricesService,
    public popup: PopupsRef,
    public textSrv: TextService,
    public domSrv: DomService,
    public eventSrv: EventService
  ) {}

  onCloseThisPopUp(): number {
    return this.onClose(this.config.data.numberOfBoxes);
  }

  ngOnInit(): void {
    this.domSrv.addClasses('body', ['no-scroll']);
    this.up = this.config.data.up;
    this.availableCountriesByISO = this.config.data.availableCountriesByISO;
    this.location = this.config.data.location;
    this.weightUnit = this.config.data.weightUnit;
    this.weight = this.config.data.weight;
    this.minStepMS = this.config.data.minStepMS;
    this.numberOfBoxes = this.config.data.numberOfBoxes > this.minStepMS ?
      this.config.data.numberOfBoxes :
      this.minStepMS;
    this.maxStepMS = this.config.data.maxStepMS;
    this.isMultishot = this.config.data.isMultishot;
    this.price = this.config.data.price;
    this.pricePerKilo = this.price.amount / (this.weight * this.numberOfBoxes);
    this.crowdfarmerCurrency = this.price.currency.crowdfarmer;

    if (this.config.data.newLocation) {
      void this.countryChanged(this.config.data.newLocation);
    }
  }

  ngOnDestroy(): void {
    this.domSrv.removeClasses('body', ['no-scroll']);
    this.onCloseThisPopUp();
  }

  /**
   * Change and updates ums value, then recalculates the price
   *
   * @param step 1 | -1
   */
  async addSubsctractUms(step: number): Promise<any> {
    this.numberOfBoxes = this.numberOfBoxes + step;
    // Refresh price
    await this.getPrices(this.location, this.numberOfBoxes);
  }

  quantityChangeHandler(quantity: number): void {
    this.config.data.numberOfBoxes = quantity;
  }

  // Country Changed
  async countryChanged(country: string): Promise<any> {
    this.location = country;
    await this.getPrices(country, this.numberOfBoxes);
  }

  /**
   * Calculate prices
   */
  async getPrices(location: string, numberOfBoxes: number): Promise<void> {
    if (!this.location || (this.isMultishot && !numberOfBoxes)) {
      return;
    }

    const upType = this.isMultishot ? 'MULTI_SHOT_ADOPTION' : 'ONE_SHOT';

    try {
      const price = await this.priceSrv.get(this.up, location, upType, numberOfBoxes);

      if (price) {
        this.price = price || null;
        this.pricePerKilo = price.amount / (this.weight * numberOfBoxes);
        this.crowdfarmerCurrency = this.price.currency.crowdfarmer;
      }
    } catch (e) {
      this.price = null;
    }
  }

  displayToolTip(isVisibleTooltip = false): void {
    this.showTooltip = isVisibleTooltip;
  }

  toggleDisplayCollapsibleContent(): void {
    this.displayCollapsibleContent = !this.displayCollapsibleContent;
  }
}
