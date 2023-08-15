import { Injectable, Injector } from '@angular/core';
import { BaseService } from '../base';
import { CrossSellingResource } from '../../resources';
import { StorageService } from '../storage';
import { ConfigService } from '../config';
import { first, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { SealsService } from '../../pages/farmer/services/seals';
import { REMOTE_CONFIG } from '@app/constants/remote-config.constants';

@Injectable({
  providedIn: 'root',
})
export class CrossSellingService extends BaseService {
  constructor(
    private crossSellingRsc: CrossSellingResource,
    private sealsSrv: SealsService,
    public injector: Injector,
    public storageSrv: StorageService,
    public configSrv: ConfigService
  ) {
    super(injector);
  }

  /**
   * Get crossSelling promos. Specifications are included in body
   */
  public async getCrossSellingPromos(body: any): Promise<any> {
    const crossSellingPromos = await this.crossSellingRsc.getCrossSellingPromos(body);

    return this.modelize(crossSellingPromos);
  }

  /**
   * Get crossSelling info for popup in adoption
   */
  public async getCrossSellingAdoptionInfo(code: string): Promise<any> {
    const crossSellingInfo = await this.crossSellingRsc.getCrossSellingAdoptionInfo(code);

    return this.modelize(crossSellingInfo);
  }

  /**
   * Get crossSelling promos. Specifications are included in body
   */
  public async getCrossSelling(country: string, cart?: string, limit?: number): Promise<any> {
    const user = this.storageSrv.getCurrentUser();
    let query = `?country=${country}`;

    if (user?._id) {
      query = query + '&crowdfarmer=' + user._id;
    }

    if (cart && cart.length) {
      query = query + '&' + cart;
    }

    if (limit) {
      query = `${query}&limit=${limit}`;
    }

    let crossSellingPromos = await this.crossSellingRsc.getCrossSelling(query);

    crossSellingPromos = await this.geCrossSellingPromosWithSeals(crossSellingPromos);

    return this.modelize(crossSellingPromos);
  }

  private getCsActiveParams(): Observable<any> {
    return this.configSrv.getValue(REMOTE_CONFIG.CS_ACTIVE_PARAMS).pipe(
      map((config) => {
        try {
          return JSON.parse(config._value);
        } catch (err) {
          return {
            isCsActive: true,
            isCsCartActive: true,
            isCsUpPageActive: true,
            isCsOhActive: true,
            isCsThanksActive: true,
            isCsContactActive: true,
            isCsGoInvitationActive: true,
            isCsFarmersMarketActive: true,
          };
        }
      })
    );
  }

  public isCsActive(page: string): Observable<boolean> {
    return this.getCsActiveParams().pipe(first((res) => typeof res === 'object' && res.isCsActive && res[`isCs${page}Active`]));
  }

  private async geCrossSellingPromosWithSeals(promos: any): Promise<any> {
    const promosWithSeals = {};

    for (const promoKey of Object.keys(promos)) {
      promosWithSeals[promoKey] = await Promise.all(
        promos[promoKey].map((project) => {
          const upSeals = this.sealsSrv.getCompleteSeals(project.seals, project.featuredSeal);

          return {
            upSeals,
            ...project,
          };
        })
      );
    }

    return promosWithSeals;
  }
}
