import { Injectable, Injector } from '@angular/core';
import { CompleteSeals, HeaderSeal, ProjectSeals, Seal } from '@app/interfaces/seals.interface';
import { TranslocoService } from '@ngneat/transloco';

import { BaseService } from '@services/base';
import { TransferStateService } from '@services/transfer-state';
import { SealsResource } from '../../resources/seals';
import { SEAL_ORGANIC_CODE, SEAL_CONVERSION_TO_ORGANIC_CODE } from '../constant/seal.contants';

let sealsCache: any;

@Injectable({
  providedIn: 'root',
})
export class SealsService extends BaseService {
  seals: Seal[];

  constructor(
    private sealsRsc: SealsResource,
    private transferStateSrv: TransferStateService,
    private translocoSrv: TranslocoService,
    public injector: Injector
  ) {
    super(injector);
  }

  /**
   * Get all seals
   */
  public async setAllSeals(): Promise<void> {
    let seals;

    const stateKey = `seals_all`;

    seals = this.transferStateSrv.get(stateKey, null);
    if (seals === null) {
      if (sealsCache && sealsCache.time && sealsCache.time >= new Date().getTime()) {
        seals = sealsCache.data;
        this.transferStateSrv.set(stateKey, seals);
      } else {
        seals = !this.seals ? await this.sealsRsc.getAll() : this.seals;
        this.transferStateSrv.set(stateKey, seals);
        // Store it
        sealsCache = {
          data: seals,
          time: new Date().getTime() + 25000 * 1000,
        };
      }
    }

    seals.list = this.modelize(seals.list);
    this.seals = seals.list;
  }

  public getCompleteSeals(projectSeals: ProjectSeals[], featuredSealId: string): CompleteSeals {
    const allSeals: Seal[] =
      projectSeals?.map((upSeal) => ({
        ...this.seals?.find((seal) => seal._id === upSeal._seal),
        files: upSeal.files,
      })) ?? [];

    const unOfficialSeals = allSeals.filter((seal) => !seal.isOfficial);
    const officialSeals = allSeals.filter((seal) => seal.isOfficial);

    const featuredSeal = officialSeals.find((seal) => seal._id === featuredSealId);
    const organicSeal = officialSeals.find((seal) => seal.code === SEAL_ORGANIC_CODE);
    const conversionToOrganicSeal = unOfficialSeals.find((seal) => seal.code === SEAL_CONVERSION_TO_ORGANIC_CODE);

    if (conversionToOrganicSeal) {
      conversionToOrganicSeal.shortDescription = 'global.converting-to-organic.label';
    }

    let headerSeals: Seal[] = [];
    let detailSeals: Seal[] = [];

    // Card header seals
    if (featuredSeal) {
      // Organic + is Featured
      headerSeals = organicSeal ? [organicSeal, featuredSeal] : [featuredSeal];
    } else {
      if (organicSeal) {
        // Organic
        headerSeals = [organicSeal];
      } else {
        // Conversion to Organic or Nothing
        headerSeals = conversionToOrganicSeal ? [conversionToOrganicSeal] : [];
      }
    }

    const header: HeaderSeal[] = headerSeals.map((headerSeal) => this.sealToHeaderSeal(headerSeal));

    // Detail header seals
    if (officialSeals.length) {
      // Organic + Beyond Organic
      const beyondOrganicSeals = officialSeals.filter((seal) => seal.code !== SEAL_ORGANIC_CODE);

      detailSeals = organicSeal ? [organicSeal, ...beyondOrganicSeals] : beyondOrganicSeals;
    } else {
      // Conversion to Organic or Nothing
      detailSeals = conversionToOrganicSeal ? [conversionToOrganicSeal] : [];
    }

    const detailHeader: HeaderSeal[] = detailSeals.map((detailSeal) => this.sealToHeaderSeal(detailSeal));

    return {
      header,
      detailHeader,
      official: officialSeals,
      unOfficial: unOfficialSeals,
    };
  }

  private sealToHeaderSeal(seal: Seal): HeaderSeal {
    return {
      id: seal._id,
      src: seal.imageUrl,
      isTag: !seal.isOfficial,
      label: seal.shortDescription,
      key: seal.shortDescription,
    };
  }
}
