import { Injectable, Injector } from '@angular/core';
import { BaseService } from '../../../../services';
import { SurveyOptionsResource } from '../../resources/survey-options';
import { SurveyName, SurveyOption } from '../../interfaces/survey.interface';

@Injectable({
  providedIn: 'root',
})
export class SurveyOptionsService extends BaseService {
  constructor(private surveyOptionsRsc: SurveyOptionsResource, public injector: Injector) {
    super(injector);
  }

  public getSurveyOptions(surveyName: SurveyName): Promise<SurveyOption[]> {
    return this.surveyOptionsRsc.getSurveyOptions(surveyName);
  }
}
