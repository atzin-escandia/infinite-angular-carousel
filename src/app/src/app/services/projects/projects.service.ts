import { Injectable, Injector } from '@angular/core';
import { Filters } from '@enums/filters.enum';
import { LangService } from '@app/services';
import { BaseService } from '../base';
import { TransferStateService } from '../transfer-state';
import { DomService } from '../dom';
import { ProjectsResource } from '../../resources';
import { CountryService } from '../country';
import { SealsService } from '../../pages/farmer/services/seals';

const cacheFilters = {};

@Injectable({
  providedIn: 'root',
})
export class ProjectsService extends BaseService {
  constructor(
    private projectsRsc: ProjectsResource,
    private transferStateSrv: TransferStateService,
    private domSrv: DomService,
    private countrySrv: CountryService,
    private sealsSrv: SealsService,
    private langSrv: LangService,
    public injector: Injector
  ) {
    super(injector);
  }

  public async getAdoptionProjects(params: any): Promise<any> {
    if (params?.dates?.length) {
      params.dateFrom = params.dates[0];
      params.dateTo = params.dates.length > 1 && params.dates[1] ? params.dates[1] : params.dates[0];

      delete params.dates;
    }

    params && !params.country && (params.country = this.countrySrv.getCountry());

    let projects = await this.projectsRsc.getAdoptionProjects(params);

    // Add seals
    projects = await this.getProjectsWithSeals(projects);

    // Modelize it
    projects = this.modelize(projects);

    return projects;
  }

  public async getOhProjects(params: any): Promise<any> {
    if (params && params.dates && params.dates.length > 0) {
      params.dateFrom = params.dates[0];
      params.dateTo = params.dates.length > 1 && params.dates[1] ? params.dates[1] : params.dates[0];

      delete params.dates;
    }

    params && !params.country && (params.country = this.countrySrv.getCountry());

    let projects = await this.projectsRsc.getOhProjects(params);

    // Add seals
    projects = await this.getProjectsWithSeals(projects);

    // Modelize it
    projects = this.modelize(projects);

    return projects;
  }

  public async getAgroupments(params: any): Promise<any> {
    const stateKey = `getAgroupments_${JSON.stringify(params)}`;

    let agroupments = this.transferStateSrv.get(stateKey, null);

    if (agroupments === null) {
      agroupments = await this.projectsRsc.getAgroupments(params);
      this.transferStateSrv.set(stateKey, agroupments);
    }

    // Add seals
    agroupments = await this.getAgroupmentsWithSeals(agroupments);

    // Modelize it
    agroupments = this.modelize(agroupments);

    return agroupments;
  }

  public async getPrices(code: string): Promise<any> {
    let result;

    const stateKey = `getPriceAllCountries_${code}`;

    result = this.transferStateSrv.get(stateKey, null);
    if (result === null) {
      result = await this.projectsRsc.getPrices(code);
      this.transferStateSrv.set(stateKey, result);
    }

    return result;
  }

  /**
   * Get seals for home filtering
   */
  public async getFilterCriteria(criteria: string): Promise<any> {
    let result;

    const stateKey = `filterCriteria_${criteria}`;

    if (
      this.domSrv.isPlatformBrowser() &&
      cacheFilters[criteria] &&
      cacheFilters[criteria].time &&
      cacheFilters[criteria].time >= new Date().getTime()
    ) {
      result = cacheFilters[criteria].data;
    } else {
      result = this.transferStateSrv.get(stateKey, null);
      if (result === null) {
        const filters = await this.projectsRsc.getFilterCriteria(criteria);

        result = this.sortFiltersCriteria(filters, criteria);
        this.transferStateSrv.set(stateKey, result);
      }

      // Store it
      cacheFilters[criteria] = {
        data: result,
        time: new Date().getTime() + 25000 * 1000,
      };
    }

    result.map((e) => {
      e.checked = false;
      e.available = true;
      if (criteria === 'seals') {
        e._m_name = e._m_shortDescription;
      }
      if (criteria === 'farmers') {
        e.queryValue = e.iso;
      } else {
        e.queryValue = e._id;
      }
    });

    return result;
  }

  private sortFiltersCriteria(filters: Record<string, any>[], criteria: string): Record<string, any>[] {
    const lang = this.langSrv.getCurrentLang();
    let sortedFilters = filters;

    if (criteria === Filters.categories) {
      sortedFilters = filters.sort((a, b) => Number(a.code) - Number(b.code));
    } else if (criteria === Filters.farms) {
      sortedFilters = filters.sort((a, b) => a._m_name[lang].localeCompare(b._m_name[lang]));
    } else if (criteria === Filters.seals) {
      sortedFilters = filters.sort((a, b) => a._m_shortDescription[lang].localeCompare(b._m_shortDescription[lang]));
    }

    return sortedFilters;
  }

  private async getProjectsWithSeals(projects: any[]): Promise<any[]> {
    return Promise.all(
      projects.map((project) => {
        const upSeals = this.sealsSrv.getCompleteSeals(project.up.seals, project.up.featuredSeal);

        return {
          upSeals,
          ...project,
        };
      })
    );
  }

  private async getAgroupmentsWithSeals(agroupments: any[]): Promise<any[]> {
    return Promise.all(
      agroupments.map(async (agroupment) => {
        const projects = await this.getProjectsWithSeals(agroupment.projects);

        return {
          ...agroupment,
          projects,
        };
      })
    );
  }
}
