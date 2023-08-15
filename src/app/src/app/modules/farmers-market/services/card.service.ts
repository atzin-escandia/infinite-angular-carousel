import { Injectable, Injector } from '@angular/core';
import { BaseService, CountryService, LangService, RouterService } from '@app/services';
import { PAGE_TYPES, Page } from '@modules/farmers-market/types/page.types';
import dayjs from 'dayjs';
import { TranslocoService } from '@ngneat/transloco';
import { MIN_DISCOUNT_PERCENTAGE, MULTI_SHOTS, ONE_SHOT } from '@pages/farmer/up/constants/up.constants';
import { MasterBox } from '@interfaces/master-box.interface';
import { MasterBoxCardInfo } from '../interfaces/master-box-card-info.interface';
import { UnknownObjectType } from '@app/interfaces';
import { OVERHARVEST_SUFFIX } from '@app/pages/farmer/overharvest/constants/overharvest.constants';
import { PROJECT_TYPE } from '@constants/landing.constants';
import { SealsService } from '@pages/farmer/services/seals';

@Injectable({
  providedIn: 'root',
})
export class CardService extends BaseService {
  currentLang = 'de';
  currentCountry = 'de';
  type: Page;
  searchPath: string;
  projects: any;

  constructor(
    public countrySrv: CountryService,
    public injector: Injector,
    public translocoSrv: TranslocoService,
    public langSrv: LangService,
    public routerSrv: RouterService,
    private sealSrv: SealsService
  ) {
    super(injector);
  }

  init: any = () => null;

  setDefaultMasterBox(projects: any): any {
    projects.forEach((project) => {
      project.defaultMb = this.getSelectedMbInfo(project.filters.masterBoxes[0]);
    });

    return projects;
  }

  getAvailableMb(masterBoxes: MasterBox[]): MasterBox {
    for (const mb of masterBoxes) {
      if (mb.ohDates?.first) {
        const availableMb = mb;

        return availableMb;
      }
    }

    return masterBoxes[0];
  }

  getType(): Page {
    return this.type;
  }

  setType(type: Page): void {
    this.type = type;
  }

  setCountryAndLang(country: string, lang: string): void {
    this.currentCountry = country;
    this.currentLang = lang;
  }

  setDeliveryDates(project: any): string {
    const deliveryDate = this.type === PAGE_TYPES.ADOPTIONS ? project.filters.adoptionDates?.first : project.filters.ohDates?.first;

    return dayjs(deliveryDate).format('DD/MM/YYYY');
  }

  getAdoptionText(up: any, forcedType?: string): string {
    const publicVariety: string = up._m_publicVariety[this.currentLang];
    const projectType = forcedType || this.type;

    return projectType === PAGE_TYPES.ADOPTIONS ? `${this.translocoSrv.translate<string>('global.Adopt.text-info')} ${publicVariety}` : '';
  }

  getWeight(project: any): string {
    const adoptionMb = this.getFirstMbForAdoption(project.filters.masterBoxes);

    let result = '';

    if (adoptionMb) {
      result = `(${adoptionMb.weight} ${adoptionMb._m_weightUnit[this.currentLang] as string})`;

      if (project.up.sellingMethod === MULTI_SHOTS) {
        result = this.translocoSrv.translate<string>('global.minimum-kg.text-info', {
          unit: `${project.up.minStepMS * adoptionMb.weight} ${adoptionMb._m_weightUnit[this.currentLang] as string}`,
        });
      } else if (project.up.sellingMethod === ONE_SHOT && project.filters.masterBoxes.length > 1) {
        result = this.translocoSrv.translate<string>('global.minimum-kg.text-info', {
          unit: `${adoptionMb.weight} ${adoptionMb._m_weightUnit[this.currentLang] as string}`,
        });
      }
    }

    return result;
  }

  getMbAdoptionFirstDate(project: any): string {
    const adoptionMb = this.getFirstMbForAdoption(project.filters.masterBoxes);
    const availableDate = adoptionMb?.adoptionDates?.first;

    return availableDate ? dayjs(availableDate).format('DD/MM/YYYY') : this.translocoSrv.translate<string>('page.not-available-box.drop');
  }

  getFirstMbForAdoption(masterBoxes: MasterBox[]): MasterBox {
    return masterBoxes.find((mb) => mb.adoptionActive);
  }

  setHref(project: any, lang: boolean = true, forcedType?: string): string {
    let projectHref = '';
    const projectType = forcedType || this.type;
    const type = projectType === PROJECT_TYPE.ADOPTIONS ? '' : OVERHARVEST_SUFFIX;
    const farmerSlug: string = project?.farmer?.slug;
    const projectUpSlug: string = project?.up?._m_upSlug[this.currentLang];

    if (farmerSlug && projectUpSlug) {
      const projectRoute = `farmer/${farmerSlug}/up/${projectUpSlug}${type}`;

      projectHref = lang ? `${this.currentLang}/${projectRoute}` : projectRoute;
    }

    return projectHref;
  }

  navigateToDetail(project: UnknownObjectType, forcedType?: string): void {
    const href = this.setHref(project, false, forcedType);

    this.routerSrv.navigate(href);
  }

  getTagState(project: any, forcedType?: string): string {
    let tagStateText = '';

    if (project.currentBillingSeason.remainingUnits <= 0) {
      tagStateText = 'no-units';
    } else if (project.currentBillingSeason.remainingUnits <= 30) {
      tagStateText = 'last-units';
    }

    if (this.areAllMbsDisabled(project.filters.masterBoxes, forcedType)) {
      tagStateText = 'not-available';
    }

    return tagStateText;
  }

  areAllMbsDisabled(masterBoxes: MasterBox[], forcedType?: string): boolean {
    return !masterBoxes.some((mb) => this.isMbAvailable(mb, forcedType));
  }

  isMbAvailable(mb: MasterBox, forcedType?: string): boolean {
    const projectType = forcedType || this.type;

    return projectType === PAGE_TYPES.ADOPTIONS ? !!mb?.adoptionDates?.first : !!mb?.ohDates?.first;
  }

  getTagText(project: any, forcedType?: string): { key: string; params: number | null } {
    let key = '';
    let params = null;

    if (project.currentBillingSeason.remainingUnits <= 0) {
      key = 'notification.no-units-left.text-info';
    } else if (project.currentBillingSeason.remainingUnits <= 30) {
      key = 'global.remaining-units.tab';
      params = project.currentBillingSeason.remainingUnits;
    }

    if (this.areAllMbsDisabled(project.filters.masterBoxes, forcedType)) {
      key = 'global.currently-not-available-text-info';
    }

    return { key, params };
  }

  getMbOhWeight(mb: MasterBox): string {
    return mb
      ? `${mb.weight} ${mb._m_weightUnit[this.currentLang] as string}/${this.translocoSrv.translate<string>('global.box.text')}`
      : '';
  }

  isMBsSelectorVisibleForOh(masterBoxes: MasterBox[]): boolean {
    return masterBoxes?.filter((mb) => mb.ohActive).length > 1;
  }

  setDiscount(mbsInfo: any, mbsData: any): any {
    try {
      if (mbsData.length > 1) {
        const smallestItem = mbsData.reduce((min, item) => (item.weight < item.weight ? item : min));
        const discountPercentages = mbsData.map((item) => item.weight !== smallestItem.weight && this.calculateSavings(item, smallestItem));

        return mbsInfo.map((item, i) => ({
          ...item,
          ...(discountPercentages[i] &&
            discountPercentages[i] > MIN_DISCOUNT_PERCENTAGE && {
              details: this.translocoSrv.translate('global.discount-percentage.text-info', { discount: discountPercentages[i] }),
            }),
        }));
      } else {
        return mbsInfo;
      }
    } catch (error) {
      return mbsInfo;
    }
  }

  calculateSavings(currentItem: any, smallestItem: any): number {
    const smallestPrice = smallestItem.ohPrice.amount / smallestItem.weight;
    const masterBoxPrice = currentItem.ohPrice.amount / currentItem.weight;
    const discount = ((smallestPrice - masterBoxPrice) / smallestPrice) * 100;

    // MIN_DISCOUNT_PERCENTAGE in setDiscount to avoid show less than 5% discount
    return Math.ceil(discount);
  }

  getMbsInfo(masterBoxes: MasterBox[]): MasterBoxCardInfo[] {
    const allMbsInfo: MasterBoxCardInfo[] = [];

    masterBoxes
      .filter((mb) => mb.ohActive)
      .map((mb) => {
        const mbInfo: MasterBoxCardInfo = {
          id: mb.id,
          text: this.getMbText(mb),
          disabled: !this.isMbAvailable(mb),
        };

        allMbsInfo.push(mbInfo);
      });

    return allMbsInfo;
  }

  setMbOptions(projects: any): any {
    projects.map((project) => {
      project.mbsInfo = this.getMbsInfo(project.filters.masterBoxes);
      project.options = this.setDiscount(project.mbsInfo, project.filters.masterBoxes);
    });

    return projects;
  }

  getMbText(mb: MasterBox): string {
    return `${mb?.weight} ${mb?._m_weightUnit[this.currentLang] as string}`;
  }

  getSelectedMbInfo(selectedMb?: MasterBox): MasterBoxCardInfo {
    return {
      id: selectedMb?.id ?? 'not available',
      text: selectedMb ? this.getMbText(selectedMb) : this.translocoSrv.translate<string>('page.not-available-box.drop'),
      disabled: selectedMb ? !this.isMbAvailable(selectedMb) : true,
    };
  }

  isButtonDisabled(project: any): boolean {
    return !this.isMbAvailable(project.selectedMb || this.getAvailableMb(project.filters.masterBoxes));
  }

  getMbOhFirstDate(project: any): string {
    const availableDate = project.selectedMb ? project.selectedMb?.ohDates?.first : project.filters.ohDates?.first;

    return availableDate ? dayjs(availableDate).format('DD/MM/YYYY') : this.translocoSrv.translate<string>('page.not-available-box.drop');
  }

  getPrice(project: any): number {
    return this.type === PAGE_TYPES.BOXES ? this.getMbOhPrice(project) : this.getMbAdoptionPrice(project);
  }

  getMbOhPrice(project: any): number {
    return +project.selectedMb?.ohPrice?.amount || +project.filters.masterBoxes[0]?.ohPrice?.amount;
  }

  getActiveMasterBox(project: any, selectedMb: MasterBox): MasterBox {
    return project?.filters?.masterBoxes?.find((mb: MasterBox) => mb.id === selectedMb?.id);
  }

  getMbAdoptionPrice(project: any): number | null {
    const adoptionMb = this.getFirstMbForAdoption(project.filters.masterBoxes);

    return +adoptionMb?.price?.amount || null;
  }

  areMultipleMasterBoxesInOneShot(project: any): boolean {
    const adoptionBoxes = project?.filters?.masterBoxes.filter((mb: MasterBox) => mb.adoptionActive);

    return adoptionBoxes?.length > 1 && project.up.sellingMethod === ONE_SHOT;
  }

  async setProjectSeals(projects: any): Promise<any> {
    await this.sealSrv.setAllSeals();

    projects.map((project) => {
      project.upSeals = this.sealSrv.getCompleteSeals(project.up?.seals, project.up?.featuredSeal);
    });
  }
}
