import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { SelectOption } from '@app/interfaces/select.interface';
import { ISubscriptionAvailability, ISubscriptionConfiguration } from '@interfaces/subscription.interface';
import { SubscriptionService, UtilsService } from '@app/services';
import { SubscriptionOptions, SubscriptionOptionsSelected } from './subscription-selector.interface';
import { PopoverService } from '@app/services/popover';

@Component({
  selector: 'subscription-selector',
  templateUrl: './subscription-selector.component.html',
  styleUrls: ['./subscription-selector.component.scss'],
})
export class SubscriptionSelectorComponent implements OnInit {
  @Input() subscriptionAvailability: ISubscriptionAvailability;
  @Input() selectedDate: string;
  @Input() currentSubscription: ISubscriptionAvailability;
  @Input() index: number;

  @Output() selectOption = new EventEmitter<ISubscriptionConfiguration>();

  calendarSelectorId: string;
  options: SubscriptionOptions = { dates: [], frequencies: [] };
  optionsSelected: SubscriptionOptionsSelected = { date: null, frequency: null };
  isOpenSubscriptionCalendar = false;

  constructor(private popoverSrv: PopoverService, private subscriptionSrv: SubscriptionService, public utilsSrv: UtilsService) {}

  ngOnInit(): void {
    const defaultFrequency = this.subscriptionAvailability?.options[0];

    this.calendarSelectorId = `subscription-date-selector-${this.index}`;
    this.options = this.subscriptionSrv.getOptions(defaultFrequency, this.subscriptionAvailability);
    this.optionsSelected = this.subscriptionSrv.getOptionsSelected(
      defaultFrequency,
      this.selectedDate,
      this.options,
      this.currentSubscription,
    );
  }

  handleOnChangeCalendarSelector(): void {
    const componentName = 'CalendarShipmentComponent';

    this.isOpenSubscriptionCalendar = true;

    this.popoverSrv.open(componentName, this.calendarSelectorId, {
      inputs: {
        product: {
          availableDates: this.options.dates,
        },
      },
      outputs: {
        save: (date: string) => {
          this.optionsSelected.date = date;
          this.emitSubscriptionConfiguration();
        },
        onClose: () => {
          this.popoverSrv.close(componentName);
          this.isOpenSubscriptionCalendar = false;
        },
      },
    });
  }

  handleOnChangeFrequency(ev: SelectOption): void {
    const option = JSON.parse(ev.id);

    const subscriptionOption = this.subscriptionAvailability?.options?.find(
      (item) => item.frequency === option.frequency && item.units === option.units
    );

    if (subscriptionOption) {
      this.options.dates = subscriptionOption.dates;
      this.optionsSelected.frequency = this.options.frequencies.find((item) => item.id === ev.id);
      this.optionsSelected.date = this.options.dates[0];

      this.emitSubscriptionConfiguration();
    }
  }

  private emitSubscriptionConfiguration(): void {
    const { date, frequency } = this.optionsSelected;
    const subscriptionConfiguration = JSON.parse(frequency.id);

    this.selectOption.emit({
      date,
      frequency: subscriptionConfiguration.frequency,
      units: subscriptionConfiguration.units,
    });
  }
}
