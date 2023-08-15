import { Injectable } from '@angular/core';
import { ApiResource, BaseResource } from '../../../../resources';
import { SurveyName, SurveyOption } from '../../interfaces/survey.interface';

@Injectable({
  providedIn: 'root',
})
export class SurveyOptionsResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  /**
   * Get survey options
   */
  public getSurveyOptions(surveyName: SurveyName): Promise<SurveyOption[]> {
    return this.apiRsc.get({ service: `survey-options/${surveyName}` });
  }
}
