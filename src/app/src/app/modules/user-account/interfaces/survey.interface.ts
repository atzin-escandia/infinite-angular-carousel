export type SurveyName = 'deletedAccountFeedbackSurvey' | 'liberateAdoptionSurvey';

export interface SurveyOption {
  _id: string;
  label: string;
  responseID: string;
  surveyName: SurveyName;
  order: number;
}
