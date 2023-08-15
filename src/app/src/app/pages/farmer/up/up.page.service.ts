import { Injectable, Injector } from '@angular/core';
import { BaseService, CalendarService, DomService, PricesService, ProjectsService } from '@app/services';
import { IMenuOptions } from './interfaces/menu-options.interface';
import {
  MENU_OPTIONS_HISTORY,
  MENU_OPTIONS_INFO,
  MH_OPEN_EFFECT_ID,
  MULTI_SHOTS,
  MULTI_SHOT_ADOPTION,
  ONE_SHOT,
  OVERHARVEST,
} from './constants/up.constants';

@Injectable({
  providedIn: 'any',
})
export class UpPageService extends BaseService {
  constructor(
    public injector: Injector,
    private domSrv: DomService,
    private priceSrv: PricesService,
    private ProjectsSrv: ProjectsService,
    private calendarSrv: CalendarService
  ) {
    super(injector);
  }

  // Getters
  public getMenuOptions(): IMenuOptions[] {
    return [
      {
        name: MENU_OPTIONS_INFO,
        clicked: true,
      },
      {
        name: MENU_OPTIONS_HISTORY,
        clicked: false,
      },
    ];
  }

  /**
   * Calculate prices
   */
  public async getPrices(info: any, up: any, location: string, isMultiShot: boolean): Promise<any> {
    let totalBoxes = info.totalBoxes || info;

    if (info.totalBoxes === 0) {
      totalBoxes = info.totalBoxes;
    }

    const adoptionType = isMultiShot ? MULTI_SHOT_ADOPTION : ONE_SHOT;
    const upType = info.overharvest ? OVERHARVEST : adoptionType;

    if (location) {
      if (totalBoxes) {
        return await this.getPrice(info, up, location, totalBoxes, upType);
      } else {
        if (isMultiShot) {
          return;
        } else {
          return await this.getPrice(info, up, location, totalBoxes, upType);
        }
      }
    } else {
      return;
    }
  }

  private async getPrice(info, up, location, totalBoxes, upType): Promise<any> {
    try {
      const price = await this.priceSrv.get(info.up || up, info.location || location, upType, totalBoxes);

      return price || null;
    } catch (e) {
      return null;
    }
  }

  public async getPriceAllCountries(code: string): Promise<any> {
    try {
      const price = await this.ProjectsSrv.getPrices(code);

      return price || null;
    } catch (e) {
      return null;
    }
  }

  public async getDates(up: any, location: string): Promise<any> {
    try {
      return await this.calendarSrv.getAvailableDates(location, {
        type: up.sellingMethod === MULTI_SHOTS ? OVERHARVEST : ONE_SHOT,
        masterBox: up.masterBoxes[0]._id,
        up,
        ...{ stepMS: up.minStepMS },
      });
    } catch (e) {
      return null;
    }
  }

  /**
   * Check if texts need read more button
   */
  public needsReadMore(overflowedSelector: string, effectSelector?: string): boolean | void {
    if (!this.domSrv.isPlatformBrowser()) {
      return false;
    }
    const divOverflowed = this.domSrv.getElement(overflowedSelector);
    const divEffect = effectSelector ? this.domSrv.getElement(effectSelector) : divOverflowed;

    if (!divEffect) {
      return;
    }

    if (divEffect.classList.contains(MH_OPEN_EFFECT_ID)) {
      return true;
    } else {
      return divOverflowed.scrollHeight > divOverflowed.offsetHeight + 1;
    }
  }

  public sortCountries(countries: any): any {
    countries = countries.sort((a: any, b: any) => {
      if (a.name.toLowerCase() > b.name.toLowerCase()) {
        return 1;
      }
      if (a.name.toLowerCase() < b.name.toLowerCase()) {
        return -1;
      }

      return 0;
    });

    return countries;
  }
}
