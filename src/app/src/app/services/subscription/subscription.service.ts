import {Injectable, Injector} from '@angular/core';
import {TranslocoService} from '@ngneat/transloco';
import {BaseService} from '../base';
import {CountryService} from '../country';
import {SubscriptionResource} from '../../resources';
import {
  ISubscriptionAvailability,
  ISubscriptionConfiguration,
  ISubscriptionFrequency
} from '../../../app/interfaces/subscription.interface';
import {SelectOption} from '../../interfaces/select.interface';
import {AddressInterface} from '../../interfaces';
import {SubscriptionOptions, SubscriptionOptionsSelected} from '@app/components/subscription-selector/subscription-selector.interface';
import {ISubscriptionOption} from '../../../app/interfaces/subscription.interface';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService extends BaseService {
  public MINIMUM_SHIPMENTS_SUBSCRIPTION = 2;

  constructor(
    private subscriptionRsc: SubscriptionResource,
    private countryRsc: CountryService,
    private translocoSrv: TranslocoService,
    public injector: Injector
  ) {
    super(injector);
  }

  // Mandatory implementation
  public init: () => null = () => null;

  public async getSubscriptionAvailability({
    masterBox,
    project,
  }: {
    masterBox: string;
    project: string;
  }): Promise<ISubscriptionAvailability> {
    const country = this.countryRsc.getCountry();

    return await this.subscriptionRsc.getSubscriptionAvailability({ country, masterBox, project });
  }

  public buildFrequencyLabel(units: number, frequency: ISubscriptionFrequency): string {
    const formattedFrequency: { [key in ISubscriptionFrequency]?: () => string } = {
      [ISubscriptionFrequency.WEEK]: () => this.translocoSrv.translate('global.every-week-frequency.text-info', { number: `${units}`}),
      [ISubscriptionFrequency.DAY]: () => this.translocoSrv.translate('global.every-day-frequency.text-info', { number: `${units}`}),
    };

    const frequencyForAOnlyUnit: { [key in ISubscriptionFrequency]?: () => string } = {
      [ISubscriptionFrequency.WEEK]: () => this.translocoSrv.translate('global.weekly-frequency.text-info'),
      [ISubscriptionFrequency.DAY]: () => this.translocoSrv.translate('global.daily-frequency.text-info'),
    };

    return units === 1 ? frequencyForAOnlyUnit[frequency]() : formattedFrequency[frequency]();
  }

  public buildFrequencyId(units: number, frequency: ISubscriptionFrequency): string {
    return JSON.stringify({ units, frequency });
  }

  public isSelectedFrequency({
    frequency,
    selectOption,
    units,
  }: {
    frequency: ISubscriptionFrequency;
    selectOption: SelectOption;
    units: number;
  }): boolean {
    const option = JSON.parse(selectOption.id) as { frequency: ISubscriptionFrequency; units: number };

    return frequency === option.frequency && units === option.units;
  }

  public async getSubscriptionOrders(user: string, status: any = null, start: number): Promise<any> {
    return await this.subscriptionRsc.getSubscriptions(user, start, status);
  }

  public async getSubscriptionDetail(id: string, start: number): Promise<any> {
    return await this.subscriptionRsc.getSubscriptionDetail(id, start);
  }

  public async changeSubscriptionShipment(id: string, shipment: AddressInterface): Promise<any> {
    return await this.subscriptionRsc.changeSubscriptionShipment(id, shipment);
  }

  public async cancelSubscription(id: string): Promise<any> {
    return await this.subscriptionRsc.cancelSubscription(id);
  }

  public getSelectorDefaultConfig(
    defaultFrequency: ISubscriptionOption,
    selectedDate: string,
    options: SubscriptionOptions,
    currentSubscription?: ISubscriptionAvailability,
  ): ISubscriptionConfiguration {
    const { date, frequency } = this.getOptionsSelected(defaultFrequency, selectedDate, options, currentSubscription);
    const subscriptionConfiguration = JSON.parse(frequency.id);

    return {
      date,
      frequency: subscriptionConfiguration.frequency,
      units: subscriptionConfiguration.units,
    };
  }

  public getOptions(defaultFrequency: ISubscriptionOption, subscriptionAvailability: ISubscriptionAvailability): SubscriptionOptions {
    return {
      dates: defaultFrequency?.dates,
      frequencies: subscriptionAvailability?.options.map(({ frequency, units }) => ({
        text: this.buildFrequencyLabel(units, frequency),
        iconRight: 'radio-button-check',
        id: this.buildFrequencyId(units, frequency),
      }))
    };
  }

  public getSelectedDate(defaultFrequency: ISubscriptionOption, selectedDate: string): string {
    return defaultFrequency.dates.find((date) => selectedDate === date);
  }

  public getOptionsSelected(
    defaultFrequency: ISubscriptionOption,
    selectedDate: string,
    options: SubscriptionOptions,
    currentSubscription?: ISubscriptionAvailability,
  ): SubscriptionOptionsSelected {
    return {
      date: currentSubscription?.options?.[0]?.dates[0] || selectedDate || defaultFrequency?.dates[0],
      frequency: options?.frequencies?.find((item) =>
        this.isSelectedFrequency({
          frequency: currentSubscription?.options[0]?.frequency || defaultFrequency?.frequency,
          selectOption: item,
          units: currentSubscription?.options[0]?.units || defaultFrequency?.units,
        })
      )
    };
  }
}
