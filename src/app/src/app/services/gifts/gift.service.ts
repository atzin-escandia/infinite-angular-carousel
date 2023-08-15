import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import dayjs from 'dayjs';
import { BaseService } from '@services/base';
import { GiftResource } from '@resources/gifts';
import { AuthService, LoggerService, RouterService, CartsService, UserService } from '@app/services';
import { DAYS_AFTER_NOTIFICATION, Events } from '@enums/events.interface';

@Injectable({
  providedIn: 'root',
})
export class GiftService extends BaseService {
  private readonly _isLoading$ = new BehaviorSubject<boolean>(false);
  readonly isLoading$ = this._isLoading$.asObservable();
  get isLoading(): boolean {
    return this._isLoading$.getValue();
  }

  constructor(
    private giftRsc: GiftResource,
    private cartSrv: CartsService,
    private authSrv: AuthService,
    private loggerSrv: LoggerService,
    private routerSrv: RouterService,
    public injector: Injector,
    private userService: UserService
  ) {
    super(injector);
  }

  public checkInfo(project: string, masterboxId: string, country: string): Promise<any> {
    return this.giftRsc.checkInfo(project, masterboxId, country);
  }

  public async handleActivation(giftHash: string, handleErrorFn?: (error: any) => void): Promise<void> {
    this._isLoading$.next(true);

    try {
      const currentUser = this.authSrv.getCurrentUser();

      if (!currentUser) {
        throw Error('Authorization required to activate gift');
      }

      await this.activate(giftHash, currentUser._id);
      this.routerSrv.navigate('private-zone/my-garden');
    } catch (error) {
      this.loggerSrv.error(error);
      handleErrorFn ? handleErrorFn(error) : this.routerSrv.navigateByEvent(Events.NOT_AVAILABLE_GIFT);
    } finally {
      this._isLoading$.next(false);
    }
  }

  public async verifyGiftHash(giftHash: string): Promise<void> {
    this._isLoading$.next(true);

    try {
      const { available: isAvailable } = await this.checkInvitation(giftHash);

      if (!isAvailable) {
        this.routerSrv.navigateByEvent(Events.NOT_AVAILABLE_GIFT);
      }

      this.authSrv.logout(false, false);
    } catch (error) {
      this.loggerSrv.error(error);
      this.routerSrv.navigateByEvent(Events.NOT_AVAILABLE_GIFT);
    } finally {
      this._isLoading$.next(false);
    }
  }

  private activate(hash: string, crowdfarmer: string): Promise<any> {
    return this.giftRsc.activate(hash, { crowdfarmer });
  }

  private checkInvitation(hash: string): ReturnType<GiftResource['checkInvitation']> {
    return this.giftRsc.checkInvitation(hash);
  }

  public getIsGiftDataFilledByIndex(gifItem: any): boolean {
    if (gifItem?.isActiveGift) {
      return !Object.entries(gifItem.info).some(([key, value]) => key !== 'message' && (value === '' || value === null));
    }

    return true;
  }

  public getIsGiftDataFilled(cart: any[]): boolean {
    let isValidForm = true;

    cart.forEach((_, i) => {
      isValidForm = isValidForm && this.getIsGiftDataFilledByIndex(this.cartSrv.getByIdx(i).gift);
    });

    return isValidForm;
  }

  public async isUserEmailSameAsGift(cart: any[]): Promise<boolean> {
    let isInvalidForm = false;

    if (this.userService.isLogged()) {
      const user = await this.userService.get(true);

      isInvalidForm = cart.some((_, i) => this.cartSrv.getByIdx(i).gift?.info?.email === user?.email);
    }

    return isInvalidForm;
  }

  public async isUserAGifter(): Promise<boolean> {
    const cart = this.cartSrv.get();

    return cart && (await this.isUserEmailSameAsGift(cart));
  }

  public getDatesToSchedule(startDate: Date, endDate: Date): string[] {
    const dates: string[] = [];

    while (dayjs(startDate) <= dayjs(endDate)) {
      dates.push(dayjs(startDate).format('YYYY-MM-DD') + 'T00:00:00.000Z');
      startDate = dayjs(
        dayjs(startDate)
          .add(1, 'days')
          .format('YYYY-MM-DD' + 'T00:00:00.000Z')
      ).toDate();
    }

    return dates;
  }

  public getIsDeliveryDateAfterDefaultMaxNotificationDate(defaultMaxNotificationDate: Date, deliveryDate: Date): boolean {
    return dayjs(deliveryDate).isAfter(defaultMaxNotificationDate);
  }

  public getAvailableDeliveryDates(defaultMaxNotificationDate: Date, availableDatesEstimatedDelivery: string[]): string[] {
    return availableDatesEstimatedDelivery.filter(
      (deliveryDate) =>
        this.getIsDeliveryDateAfterDefaultMaxNotificationDate(defaultMaxNotificationDate, dayjs(deliveryDate).toDate()) && deliveryDate
    );
  }
}
