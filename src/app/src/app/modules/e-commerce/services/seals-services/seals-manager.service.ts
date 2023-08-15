import { Injectable } from '@angular/core';
import { HeaderSeal, ProjectSeals, Seal } from '@app/interfaces';
import { SEAL_ORGANIC_CODE, SEAL_CONVERSION_TO_ORGANIC_CODE, SEALS_CATEGORIES } from '@app/pages/farmer/services/constant/seal.contants';
import { MultiLangTranslationPipe } from '@app/pipes/multilang-translation';
import { TranslocoService } from '@ngneat/transloco';

@Injectable({
  providedIn: 'root',
})
export class SealsManagerService {
  constructor(
    private translocoSrv: TranslocoService,
    private multiLangTranslationsPipe: MultiLangTranslationPipe
  ) {}

  getProjectSeals(allSeals: Seal[], projectSeals: ProjectSeals[]): Seal[] {
    return (
      projectSeals?.map((upSeal) => ({
        ...allSeals.find((seal) => seal._id === upSeal._seal),
        files: upSeal.files,
        isFeaturedSeal: upSeal.isFeaturedSeal,
      })) ?? []
    );
  }

  getUnOfficialSeals(allSeals: Seal[]): Seal[] {
    return allSeals.filter((seal) => !seal.isOfficial);
  }

  getOfficialSeals(allSeals: Seal[]): Seal[] {
    return allSeals.filter((seal) => seal.isOfficial);
  }

  getUnofficialUpSeals(allSeals: Seal[]): Seal[] {
    return allSeals.filter((seal) => seal.category === SEALS_CATEGORIES.UP && !seal.isOfficial);
  }

  getFarmerSeals(allSeals: Seal[]): Seal[] {
    return allSeals.filter((seal) => seal.category === SEALS_CATEGORIES.FARMER);
  }

  getFeaturedSeal(allSeals: Seal[]): Seal {
    return allSeals.find((seal) => seal.isFeaturedSeal && seal.isOfficial);
  }

  getOrganicSeal(allSeals: Seal[]): Seal {
    return allSeals.find((seal) => seal.code === SEAL_ORGANIC_CODE && seal.isOfficial);
  }

  getConversionToOrganicSeal(allSeals: Seal[]): Seal {
    return allSeals.find((seal) => seal.code === SEAL_CONVERSION_TO_ORGANIC_CODE && !seal.isOfficial);
  }

  getCardSeals(allSeals: Seal[]): HeaderSeal[] {
    const featuredSeal: Seal = this.getFeaturedSeal(allSeals);
    const organicSeal: Seal = this.getOrganicSeal(allSeals);
    const conversionToOrganicSeal: Seal = this.getConversionToOrganicSeal(allSeals);

    const seals: Seal[] = [];

    if (organicSeal || featuredSeal) {
      if (organicSeal) {
        seals.push(organicSeal);
      }
      if (featuredSeal && organicSeal?._id !== featuredSeal?._id) {
        seals.push(featuredSeal);
      }
    } else if (conversionToOrganicSeal) {
      // Conversion to Organic
      conversionToOrganicSeal.shortDescription = 'global.converting-to-organic.label';
      seals.push(conversionToOrganicSeal);
    }

    return this.parseSeals(seals);
  }

  getDetailSeals(allSeals: Seal[]): HeaderSeal[] {
    const organicSeal: Seal = this.getOrganicSeal(allSeals);
    const conversionToOrganicSeal: Seal = this.getConversionToOrganicSeal(allSeals);

    let seals: Seal[] = [];

    // Organic + Beyond Organic
    const beyondOrganicSeals = allSeals.filter((seal) => seal.code !== SEAL_ORGANIC_CODE && seal.isOfficial);

    if (organicSeal || beyondOrganicSeals.length) {
      seals = organicSeal ? [organicSeal, ...beyondOrganicSeals] : beyondOrganicSeals;
    } else if (conversionToOrganicSeal) {
      // Conversion to Organic
      conversionToOrganicSeal.shortDescription = 'global.converting-to-organic.label';
      seals.push(conversionToOrganicSeal);
    }

    return this.parseSeals(seals);
  }

  parseSeals(seals: Seal[]): HeaderSeal[] {
    const s = seals.map((seal) => ({
      id: seal._id,
      src: seal.imageUrl,
      isTag: !seal.isOfficial,
      label: seal.shortDescription || this.multiLangTranslationsPipe.transform(seal._m_shortDescription),
      key: seal.shortDescription,
    }));

    return s;
  }
}
