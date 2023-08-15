import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import dayjs from 'dayjs';
import { NO_AVAILABLE_DAYS_FOR_NOTIFICATION } from '@enums/events.interface';
import { IGifOptions } from '@modules/user-account/interfaces/order.interface';
import { CheckDataService, UserService, UtilsService } from '@app/services';
import { GiftService } from '@app/services';
import { PopoverService } from '@services/popover';
import { PopupsInterface } from '../popups.interface';
import { PopupsRef } from '../popups.ref';
import { UserInterface } from '../../interfaces';

@Component({
  selector: 'app-gift-configurator-popup',
  templateUrl: './gift-configurator-popup.component.html',
  styleUrls: ['./gift-configurator-popup.component.scss'],
})
export class GiftConfiguratorPopupComponent implements OnInit {
  @Output() handleInfoModal = new EventEmitter();

  showTooltip = false;
  message = '';
  selectedDate: string;
  isCalendarSelectorOpen = false;
  availableDates = [];
  giftData: IGifOptions;
  onClose: (a: boolean) => void;
  errorIn = {
    email: false,
    name: false,
  };
  isOwnGift = false;
  private user: UserInterface;

  constructor(
    public config: PopupsInterface,
    private popoverSrv: PopoverService,
    public popup: PopupsRef,
    private giftSrv: GiftService,
    public checkSrv: CheckDataService,
    public utilsSrv: UtilsService,
    public userSrv: UserService
  ) {}

  ngOnInit(): void {
    this.giftData = this.config.data.itemCart;
    this.setAvailableDates();
    this.user = this.userSrv.getCurrentUser();
  }

  shipmentPopover(): void {
    const product = {
      availableDates: this.availableDates,
    };
    const isDeliveryCopyHidden = true;
    const customClass = 'gift-inherited-styles';

    this.isCalendarSelectorOpen = true;
    this.popoverSrv.open('CalendarShipmentComponent', 'date-selector', {
      inputs: {
        product,
        isDeliveryCopyHidden,
        customClass,
      },
      outputs: {
        save: (date: string) => {
          this.selectedDate = date;
          this.giftData.date = date;
        },
        onClose: () => {
          this.popoverSrv.close('CalendarShipmentComponent');
          this.isCalendarSelectorOpen = false;
        },
      },
    });
  }

  private setAvailableDates(): void {
    const dayAfterToday = dayjs(dayjs().toDate()).add(1, 'days').toDate();

    this.availableDates = this.giftSrv.getDatesToSchedule(dayAfterToday, this.config.data.giftOptions.maxNotificationDate);
    this.selectedDate = this.giftData.date || this.availableDates[0];
  }

  displayToolTip(isVisibleTooltip = false): void {
    this.showTooltip = isVisibleTooltip;
  }

  onSelect(isChecked: boolean): void {
    this.giftData.isPrivacy = isChecked;
  }

  handleClickRadio(selectedOption: boolean): void {
    this.giftData.isSchedule = selectedOption;
    this.selectedDate = selectedOption ? this.availableDates[0] : dayjs().toDate();
    this.giftData.date = this.selectedDate;
  }

  save(): void {
    !!this.giftData.isPrivacy && !this.errorIn.email && !this.errorIn.name && !this.isOwnGift && this.onClose(true);
  }

  checkInput(field: string): void {
    const { email, name } = this.giftData;

    this.isOwnGift = this.user?.email === email;

    const fields = {
      email: email === null || !this.checkSrv.emailIsValid(email) || this.isOwnGift,
      name: name === null || this.checkSrv.inputValidLength(name, 0, 30),
    };


    this.errorIn[field] = fields[field];
  }
}
