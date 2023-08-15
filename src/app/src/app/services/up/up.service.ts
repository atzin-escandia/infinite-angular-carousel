import { Injectable, Injector } from '@angular/core';
import { MasterBoxType } from '@interfaces/master-box.interface';
import { BaseService } from '../base';
import { UpResource } from '../../resources';
import { TransferStateService } from '../transfer-state';

@Injectable({
  providedIn: 'root',
})
export class UpService extends BaseService {
  constructor(private upRsc: UpResource, private transferStateSrv: TransferStateService, public injector: Injector) {
    super(injector);
  }

  /**
   * Get up by id from server
   */
  public async get(id: string): Promise<any> {
    let up = await this.upRsc.get(id);

    up = this.modelize(up);

    return up;
  }

  /**
   * Get up by slug from server
   */
  public async getBySlug(slug: string, country: string): Promise<any> {
    let up = null;

    const stateKey = `up_${slug}_${country}`;

    up = this.transferStateSrv.get(stateKey, null);
    if (up === null) {
      up = await this.upRsc.getBySlug(slug, country);
      this.transferStateSrv.set(stateKey, up);
    }

    up = this.modelize(up);

    return up;
  }

  /**
   * Get up by slug from server
   */
  public async getBySlugFull(slug: string, country?: string): Promise<any> {
    let rawData = null;

    const stateKey = `upFull_${slug}_${country}`;

    rawData = this.transferStateSrv.get(stateKey, null);
    if (rawData === null) {
      rawData = await this.upRsc.getBySlugFull(slug, country);
      this.transferStateSrv.set(stateKey, rawData);
    }

    rawData.up = this.modelize(rawData.up);

    return rawData;
  }

  /**
   * Get up by slug from server
   */
  public async getUpCf(id: string): Promise<any> {
    let up = await this.upRsc.getUpCf(id);

    up = this.modelize(up);

    return up;
  }

  /**
   * Get upCf certificate by id
   */
  public async getUpCfCert(id: string): Promise<any> {
    return await this.upRsc.getUpCfCert(id);
  }

  /**
   * Edit upCf certificate
   */
  public async editUpCfCert(id: string, name: string, surname: string): Promise<any> {
    const body: any = {
      extra: {
        name,
        surname,
      },
    };

    return await this.upRsc.editUpCfCert(id, body);
  }

  /**
   * Get upCf profile by id
   */
  public async getUpCfProfile(id: string): Promise<any> {
    return await this.upRsc.getUpCfProfile(id);
  }

  /**
   * Get active ups
   */
  public async activeUps(): Promise<any> {
    let up = await this.upRsc.activeUps();

    up = this.modelize(up);

    return up;
  }

  /**
   * Get masterBoxes
   */
  public async getMasterBox(id: string): Promise<any> {
    return await this.upRsc.getMasterBox(id);
  }

  /**
   * Get categories
   */
  public async getCategories(): Promise<any> {
    const stateKey = `up_getCategories_all`;
    let result = this.transferStateSrv.get(stateKey, null);

    if (result === null) {
      result = await this.upRsc.getCategories();
      this.transferStateSrv.set(stateKey, result);
    }

    return result;
  }

  /**
   * Check if Up be liberated
   */
  public async canBeLiberated(id: string): Promise<any> {
    return await this.upRsc.liberatableUp(id);
  }

  /**
   * Liberate adoption
   */
  public async liberate(id: string): Promise<any> {
    return await this.upRsc.liberate(id);
  }

  /**
   * Autorenew toggle
   */
  public async toggleAutoRenew(id: string, autoRenew: boolean): Promise<any> {
    return await this.upRsc.toggleAutoRenew(id, autoRenew);
  }

  /**
   * Check product's alcohol
   */
  public checkOver18(materboxes: any[]): boolean {
    let isOver18 = false;

    materboxes.forEach((masterbox: any) => {
      if (masterbox.over18) {
        isOver18 = true;
      }
    });

    return isOver18;
  }

  public getIconForExtraInfo(type: string): string {
    switch (type) {
      case 'direction':
        return 'cf-icon-farm t-green-primary';
      case 'Altitude':
        return 'cf-icon-height';
      case 'Number of workers':
        return 'eva eva-people-outline';
      case 'Size':
        return 'eva eva-map-outline';
      case 'Flock size':
        return 'cf-icon-sheep';
      case 'Farming Techniques':
        return 'eva eva-shield-outline';
      case 'Irrigation':
        return 'eva eva-droplet-outline';
      case 'Field Type':
        return 'eva eva-sun-outline';
      case 'Company Name':
        return 'company-name';
      default:
        break;
    }
  }

  public getValidMasterBox(up: any, type: MasterBoxType): any {
    const validMasterBox = up.masterBoxes.find((item) => {
      const isActiveType = type === 'ADOPTION' ? item.adoptionActive : item.ohActive;

      return item.active && isActiveType;
    });

    return validMasterBox || null;
  }
}
