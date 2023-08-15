import { Injectable } from '@angular/core';
import { ApiResource, BaseResource } from '../../../../resources';

@Injectable({
  providedIn: 'root',
})
export class SurveyResponseResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  /**
   * Saves survey
   */
  public saveSurveyResponse(body: any): Promise<any> {
    return this.apiRsc.post({ service: 'survey-responses', body });
  }
}
