import { Injectable } from '@angular/core';
import {ICGState} from '@app/interfaces/crowdgiving.interface';
import {
  ECOMMERCE_AVAILABLE,
  ECOMMERCE_AVAILABLE_DESTINATION_COUNTRIES,
  ECOMMERCE_BANNER_AVAILABLE,
  TEST,
} from '@app/modules/e-commerce/constant/sections-available.constant';
import { REMOTE_CONFIG } from '@app/constants/remote-config.constants';
import { ISocialAvailability } from '@app/interfaces';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  private readonly _$showHeaderNavigation = new BehaviorSubject<boolean>(true);
  readonly $showHeaderNavigation = this._$showHeaderNavigation.asObservable();
  get showHeaderNavigation(): boolean {
    return this._$showHeaderNavigation.getValue();
  }

  private readonly _$showGreenBanner = new BehaviorSubject<boolean>(false);
  readonly $showGreenBanner = this._$showGreenBanner.asObservable();
  get showGreenBanner(): boolean {
    return this._$showGreenBanner.getValue();
  }

  private readonly _$currentCountry = new BehaviorSubject<string>(null);
  readonly $currentCountry = this._$currentCountry.asObservable();
  get currentCountry(): string {
    return this._$currentCountry.getValue();
  }

  private readonly _$social = new BehaviorSubject<ISocialAvailability>(null);
  readonly $social = this._$social.asObservable();
  get social(): ISocialAvailability {
    return this._$social.getValue();
  }

  private readonly _$gift = new BehaviorSubject<boolean>(null);
  readonly $gift = this._$gift.asObservable();
  get giftEnabled(): boolean {
    return this._$gift.getValue();
  }

  private readonly _$cgCart = new BehaviorSubject<ICGState>(null);
  readonly $cgCart = this._$cgCart.asObservable();
  get cgCart(): ICGState {
    return this._$cgCart.getValue();
  }

  constructor(private configSrv: ConfigService) { }

  public setShowHeaderNavigation(value: boolean): void {
    this._$showHeaderNavigation.next(value);
  }

  public setShowGreenBanner(value: boolean): void {
    this._$showGreenBanner.next(value);
  }

  public setCurrentCountry(value: string): void {
    this._$currentCountry.next(value);
  }

  public setSocial(value: ISocialAvailability): void {
    this._$social.next(value);
  }

  public setGift(value: boolean): void {
    this._$gift.next(value);
  }

  public setCgCart(value: ICGState): void {
    this._$cgCart.next(value);
  }

  public isGroupOrderAvailable(): Observable<boolean> {
    return this._getRemoteAvailabilityFromJson(REMOTE_CONFIG.GROUP_ORDER);
  }

  public isCreditsAvailable(): Observable<boolean> {
    return this._getRemoteAvailabilityFromJson(REMOTE_CONFIG.CREDITS);
  }

  public isSubscriptionAvailable(): Observable<boolean> {
    return this._getRemoteAvailabilityFromJson(REMOTE_CONFIG.SUBSCRIPTION);
  }

  public isProductGiftAvailable(): Observable<boolean> {
    return this.configSrv.getBoolean(REMOTE_CONFIG.GIFT_ENABLED);
  }

  public isApplePayEnabled(): Observable<boolean> {
    return this.configSrv.getBoolean(REMOTE_CONFIG.APPLE_PAY_ENABLED);
  }

  public getKlarnaConfig(): Observable<{ active: boolean; advertising: boolean }> {
    return this.configSrv.getValue(REMOTE_CONFIG.KLARNA).pipe(
      map((config) => {
        try {
          const val = JSON.parse(config._value);

          return val;
        } catch (err) {
          return {
            active: false,
            advertising: false,
          };
        }
      }),
      map((config) => ({
        active: config?.active,
        advertising: config?.advertising,
      }))
    );
  }

  public isGreenBannerActive(): Observable<boolean> {
    return this.configSrv.getBoolean('greenBanner');
  }

  public isECommerceAvailable(): Observable<boolean> {
    return this.configSrv.getBoolean(ECOMMERCE_AVAILABLE);
  }

  public isECommerceBannerAvailable(): Observable<boolean> {
    return this.configSrv.getBoolean(ECOMMERCE_BANNER_AVAILABLE);
  }

  public eCommerceAvailableDestinationCountries(): Observable<any> {
    return this.configSrv.getValue(ECOMMERCE_AVAILABLE_DESTINATION_COUNTRIES);
  }

  public getValueTest(): Observable<any> {
    return this.configSrv.getValue(TEST);
  }

  private _getRemoteAvailabilityFromJson(key): Observable<boolean> {
    return this.configSrv.getValue(key).pipe(
      map((config) => {
        try {
          const val = JSON.parse(config._value);

          return val;
        } catch (err) {
          return { active: false };
        }
      }),
      map((config) => config.active)
    );
  }
}
