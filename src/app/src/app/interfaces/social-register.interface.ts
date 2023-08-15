export type SocialKey = 'fb';

export interface SocialRegisterInterface {
  id: string;
  token: string;
  name: string;
  email: string;
  surnames: string;
  gender: string;
  birthday: string;
}

export interface ISocialAvailability {
  fb: boolean;
  gg: boolean;
}
