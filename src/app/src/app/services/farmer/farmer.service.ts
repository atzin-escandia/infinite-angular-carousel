import { Injectable, Injector } from '@angular/core';

import { BaseService } from '../base';
import { FarmerResource } from '../../resources';
import { TransferStateService } from '../transfer-state';
import { YOUTUBE_ID_LENGTH } from '../../pages/farmer/constants/farmer.constants';
import { IMultilingual } from '../../interfaces/multilingual.interface';

@Injectable({
  providedIn: 'root',
})
export class FarmerService extends BaseService {
  constructor(private farmerRsc: FarmerResource, private transferStateSrv: TransferStateService, public injector: Injector) {
    super(injector);
  }

  /**
   * Get up by slug from server
   */
  public async getBySlug(slug: string): Promise<any> {
    const stateKey = `farmer_${slug}`;
    let farmer = this.transferStateSrv.get(stateKey, null);

    if (farmer === null) {
      farmer = await this.farmerRsc.getBySlug(slug);
      this.transferStateSrv.set(stateKey, farmer);
    }

    return this.modelize(farmer);
  }

  public getVideoUrl(farmerVideoUrl?: IMultilingual, upVideoUrl?: IMultilingual): string {
    const currrentLang = this.langService.getCurrentLang();
    const defaultLang = this.langService.getDefaultLang();

    const videosUrl = {
      ...(farmerVideoUrl && { farmer: farmerVideoUrl[currrentLang] || farmerVideoUrl[defaultLang] }),
      ...(upVideoUrl && { up: upVideoUrl[currrentLang] || upVideoUrl[defaultLang] }),
    };

    const url = videosUrl.up || videosUrl.farmer;

    return url && FarmerService.getVideoID(url);
  }

  private static getVideoID(urlVideo: string): string {
    return urlVideo.slice(-YOUTUBE_ID_LENGTH);
  }
}
