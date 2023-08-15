import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {GiftInfoPopupComponent} from '@popups/gift-info-popup/gift-info-popup.component';
import {PopupService} from '@services/popup';
import {GiftConfiguratorPopupComponent} from '@popups/gift-configurator-popup/gift-configurator-popup.component';
import {CartsService, RouterService, UserService} from '@app/services';
import {GiftService} from '@app/services';
import {UnknownObjectType} from '@app/interfaces';
import dayjs from 'dayjs';
import {DAYS_AFTER_NOTIFICATION} from '@enums/events.interface';

@Component({
  selector: 'adoption-gift-selector',
  templateUrl: './adoption-gift-selector.component.html',
  styleUrls: ['./adoption-gift-selector.component.scss'],
})
export class AdoptionGiftSelectorComponent implements OnInit, OnChanges {
  @Output() public returnData = new EventEmitter<boolean>();
  @Input() public product: UnknownObjectType;
  @Input() public isGiftFormCompleted: boolean;
  @Input() public index: number;
  @Input() public showCheckbox?: boolean;
  @Input() public enableConfiguration?: boolean;

  public currentSection: string;
  public itemCart: UnknownObjectType;
  public isUserOwnGifter: boolean;
  public isValidForm = true;
  public doNotShowFinalPeriod: boolean;

  constructor(
    public popupSrv: PopupService,
    public cartSrv: CartsService,
    private giftSrv: GiftService,
    private routerSrv: RouterService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.currentSection = this.routerSrv.getCheckoutSection();
    this.itemCart = this.getItemCart();
    this.doNotShowFinalPeriod = this.getDoNotShowFinalPeriod();

    if (!this.itemCart?.gift?.info && this.product.gift?.giftOptions) {
      this.itemCart = {
        gift: {
          info: {
            name: this.product.gift.giftOptions.name,
          },
        },
      };
    }

    this.itemCart?.gift?.info && void this.isEmailSameAsGift();
}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.itemCart?.gift && changes.isGiftFormCompleted?.previousValue !== changes.isGiftFormCompleted?.currentValue) {
      this.isValidForm = this.giftSrv.getIsGiftDataFilledByIndex(this.itemCart.gift);
      void this.isEmailSameAsGift();
    }
  }

  public async isEmailSameAsGift(): Promise<void> {
    if (this.userService.isLogged()) {
      const user = await this.userService.get(true);

      this.isUserOwnGifter = this.itemCart.gift?.info?.email === user.email;
    }
  }

  public getItemCart(): UnknownObjectType {
    return this.currentSection ? this.cartSrv.getByIdx(this.index) : {gift: {isActiveGift: false}};
  }

  public handleGiftSelected(isGiftActivated: boolean): void {
    this.returnData.emit(isGiftActivated);
    this.itemCart.gift = this.itemCart.gift || {};
    this.itemCart.gift.isActiveGift = isGiftActivated;

    if (!isGiftActivated || !this.itemCart.gift.info) {
      // If false empty current product and itemCart
      !isGiftActivated && (this.isValidForm = true);
      this.product.gift = {
        ...this.product.gift,
        active: isGiftActivated,
        giftOptions: {},
      };

      this.isGiftFormCompleted = true;
      this.itemCart.gift.info = {
        name: null,
        email: null,
        message: null,
        isSchedule: false,
        date: new Date(),
        isPrivacy: false,
      };
    }
    this.cartSrv.updateByIdx(this.itemCart, this.index);
    this.doNotShowFinalPeriod = this.getDoNotShowFinalPeriod();
  }

  public checkGiftSetUp(): void {
    this.product.availableDates && this.setAvailableDatesEstimatedDelivery();
    this.isValidForm = this.giftSrv.getIsGiftDataFilledByIndex(this.itemCart.gift);

    this.product.gift = {
      ...this.product.gift,
      active: true,
      giftOptions: {
        ...this.product.gift.giftOptions,
        ...this.itemCart.gift.info,
      },
    };

    this.itemCart.selectedDate = this.product.selectedDate;
    this.cartSrv.updateByIdx(this.itemCart, this.index);
    void this.isEmailSameAsGift();
  }

  public openGiftInfo(): void {
    this.popupSrv.open(GiftInfoPopupComponent, {
      data: {
        close: true,
      }
    });
  }

  public openModalInfoGift(): void {
    const popup = this.popupSrv.open(GiftConfiguratorPopupComponent, {
      data: {
        close: true,
        giftOptions: this.product.gift,
        itemCart: this.itemCart.gift.info
      }
    });

    popup.onClose.subscribe(isFilledForm => isFilledForm && this.checkGiftSetUp());
  }

  private getDoNotShowFinalPeriod(): boolean {
    return (!this.enableConfiguration && !this.itemCart?.gift?.info?.name) || !this.itemCart?.gift?.isActiveGift;
  }

  private setAvailableDatesEstimatedDelivery(): void {
    !this.product.availableDatesDelivery && (this.product.availableDatesDelivery = this.product.availableDates);
    const giftNotificationDate = dayjs(this.itemCart.gift.info.date).toDate();
    const defaultNotificationDate = dayjs(giftNotificationDate.setDate(giftNotificationDate.getDate() + DAYS_AFTER_NOTIFICATION)).toDate();
    const datesAvailableDelivery = this.giftSrv.getAvailableDeliveryDates(defaultNotificationDate, this.product.availableDatesDelivery);

    this.product.selectedDate = datesAvailableDelivery[0];
    this.product.availableDates = datesAvailableDelivery;
  }

}
