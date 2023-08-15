export interface ISoftReqBody {
  country: string;
  countryDetected: string;
  name: string;
  surnames: string;
  email: string;
  notificationLanguage: string;
  registrationInfo: {
    url: string;
  };
}
