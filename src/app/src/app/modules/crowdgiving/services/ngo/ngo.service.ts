import { Injectable } from '@angular/core';
import { ApiResource } from '@app/resources';
import { INGO } from '../../interfaces/ngo.interface';
import { ICGProject } from '../../interfaces/project.interface';

@Injectable()
export class CrowdgivingNgoService {
  constructor(private apiRsc: ApiResource) { }

  getNgos(): Promise<{ count: number; list: INGO[] }> {
    return this.apiRsc.get({service: '/ngos/public'});
  }

  getNgoProject(ngoId: string): Promise<ICGProject> {
    return this.apiRsc.get({service: `ngos/${ngoId}/projects`});
  }

  getNgoBasicInfo(ngoId: string): Promise<{_id: string; name: string}> {
    return this.apiRsc.get({service: `ngos/${ngoId}/public`});
  }
}
