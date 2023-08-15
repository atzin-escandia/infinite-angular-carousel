import { Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from '@app/components';
import { CountryService, RouterService, StateService } from '@app/services';
import { ISubscriptionAvailability, ISubscriptionConfiguration } from '@interfaces/subscription.interface';
import { CountriesPopupComponent } from '@popups/countries-selector';
import { SubscriptionPopupComponent } from '@popups/subscription-popup/subscription-popup.component';
import { TranslocoService } from '@ngneat/transloco';
import { Observable } from 'rxjs';
import { HeaderSeal } from '@app/interfaces';
import { FavouritesSection } from '@interfaces/favourites.interface';

@Component({
  selector: 'oh-header',
  templateUrl: './oh-header.component.html',
  styleUrls: ['./oh-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OhHeaderComponent extends BaseComponent implements OnChanges, OnInit {
  @Input() public up: any;
  @Input() public countriesByIso: any;
  @Input() public availableDates: any;
  @Input() public location: string;
  @Input() public farmer: any;
  @Input() public price: any;
  @Input() public maxUnits: number;
  @Input() public availableCountriesByISO: any;
  @Input() public subscriptionAvailability: ISubscriptionAvailability;
  @Input() public seals: HeaderSeal[] = [];

  @Output() public addToCart = new EventEmitter();
  @Output() public addSubstract = new EventEmitter();
  @Output() public selectMasterBox = new EventEmitter();

  private cantSendCountry: boolean;
  private noDatesLeft: boolean;
  public calendarSelectorOpen = false;
  public selectedDate: string;
  public totalBoxes = 1;
  public isVisibleSubscriptionLink = false;
  public isSubscriptionAvailable$: Observable<boolean>;
  MINIMUM_DISCOUNT = 5;
  detailKey = FavouritesSection.DETAIL;

  constructor(
    public injector: Injector,
    public routerSrv: RouterService,
    public countrySrv: CountryService,
    private translocoSrv: TranslocoService,
    public stateSrv: StateService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.isSubscriptionAvailable$ = this.stateSrv.isSubscriptionAvailable();
  }

  ngOnChanges(): void {
    this.calculateProjectState();
  }

  private calculateProjectState(): void {
    this.cantSendCountry = false;
    this.noDatesLeft = false;

    // Can't send to that country
    if (!this.availableDates) {
      this.cantSendCountry = true;
    }

    // No dates to send
    if (this.availableDates?.length === 0) {
      this.noDatesLeft = true;
    }

    if (this.availableDates?.length > 0 && !this.selectedDate) {
      this.selectedDate = this.availableDates[0];
    }
  }

  handleClickSubscriptionLink(): void {
    this.popupSrv.open(SubscriptionPopupComponent, {
      data: {
        subscriptionAvailability: this.subscriptionAvailability,
        selectedDate: this.selectedDate,
        onAddToCart: (subscription: ISubscriptionConfiguration) =>
          this.addToCart.emit({
            selectedDate: subscription.date,
            frequency: { frequency: subscription.frequency, units: subscription.units },
          }),
      },
    });
  }

  /**
   * Open location selector popup
   */
  public openLocationSelector(): void {
    const countriesPopup = this.popupSrv.open(CountriesPopupComponent, {
      data: {
        countries: this.availableCountriesByISO,
        flag: true,
        source: 'up-card',
        selectedCountry: this.location,
      },
    });

    countriesPopup.onClose.subscribe((result: any) => {
      if (result || result === 0) {
        this.location = this.availableCountriesByISO[result].iso;
        this.countrySrv.setCountry(this.availableCountriesByISO[result].iso);
      }
    });
  }

  /**
   * Open shipmentPopover
   */
  public shipmentPopover(): void {
    this.calendarSelectorOpen = true;

    const product = {
      availableDates: this.availableDates,
    };

    this.popoverSrv.open('CalendarShipmentComponent', 'date-selector', {
      inputs: {
        product,
      },
      outputs: {
        save: (date: any) => {
          this.selectedDate = date;
        },
        onClose: () => {
          this.popoverSrv.close('CalendarShipmentComponent');
          this.calendarSelectorOpen = false;
        },
      },
    });
  }

  public getRightMessage(): string {
    if (!this.up.overharvestAllowed || this.maxUnits < 1) {
      return 'global.project-with-no-boxes.label';
    }
    if (this.cantSendCountry) {
      return 'page.does-not-ship.title';
    }
    if (this.noDatesLeft) {
      return 'global.not-available-shipment-dates.text-info';
    }

    return 'global.delivery-country.title';
  }

  public addSubsctractBoxes(e: number): void {
    this.addSubstract.emit(e);
    this.totalBoxes += e;
  }

  public addProductCart(): void {
    if (this.maxUnits > 0) {
      this.addToCart.emit({
        selectedDate: this.selectedDate,
        isSubscriptionAvailable: this?.subscriptionAvailability?.active || false,
      });
    }
  }

  public isMbAvailable(mb: any): boolean {
    return !!mb?.firstDate;
  }

  public getOptionMasterBoxValue(mb: any): string {
    const { weight, weightUnit }: { weight: string; weightUnit: string } = mb;
    const textMbNotAvailable: string = this.isMbAvailable(mb) ? '' : this.translocoSrv.translate('page.not-available-box.drop');

    return `${weight} ${weightUnit} ${textMbNotAvailable}`;
  }

  public emitSelectMasterBox(mb: any, index: number): void {
    if (this.isMbAvailable(mb)) {
      this.totalBoxes = 1;
      this.selectMasterBox.emit({ index, price: mb.price });
    }
  }
}
