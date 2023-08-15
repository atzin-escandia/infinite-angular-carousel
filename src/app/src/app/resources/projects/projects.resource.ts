import {Injectable} from '@angular/core';

import {BaseResource} from '../base';
import {ApiResource} from '../api';

@Injectable({
  providedIn: 'root'
})
export class ProjectsResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  public getAdoptionProjects(params: string): Promise<any> {
    return this.apiRsc.get({service: 'projects', loader: true, params});
  }

  public getOhProjects(params: string): Promise<any> {
    return this.apiRsc.get({service: 'projects/oh', loader: true, params});
  }

  public getProjectsByPage(params: string): Promise<any> {
    return this.apiRsc.get({service: 'projects', version: 'v3', loader: true, params});
  }

  public getAgroupments(params?: string): Promise<any> {
    return this.apiRsc.get({service: 'projects/agroupments/home/web', loader: false, params});
  }

  public getAgroupmentsById(id: string, params: any): Promise<any> {
    return this.apiRsc.get({service: `projects/agroupments/${id}/public`, loader: false, params});
  }

  public getFilterCriteria(criteria: string): Promise<any> {
    return this.apiRsc.get({service: 'projects/filters/' + criteria});
  }

  public getPrices(code: string): Promise<any> {
    return this.apiRsc.get({service: 'projects/get-prices/' + code});
  }
}
