import { Injectable, Injector } from '@angular/core';
import { BaseService } from '../../../../services';
import { SurveyResponseResource } from '../../resources';
import { SurveyName } from '../../interfaces/survey.interface';

@Injectable({
  providedIn: 'root',
})
export class SurveyResponseService extends BaseService {
  constructor(private SurveyResponseRsc: SurveyResponseResource, public injector: Injector) {
    super(injector);
  }

  /**
   * Saves survey
   */
  public async saveSurvey(id: any, upCf: any, message: any, surveyName: SurveyName): Promise<any> {
    const surveyData: any = {
      surveyName,
      responseID: id,
    };

    if (upCf) {
      surveyData._upCf = upCf;
    }

    if (message) {
      surveyData.message = message;
    }

    return this.SurveyResponseRsc.saveSurveyResponse(surveyData);
  }
}
