export interface UserRegisterInterface {
  type?: number;
  email: string;
  password: string;
  repassword: string;
  name: string;
  surnames: string;
}

export type ReasonRegistrationType = 'GROUP_ORDER_INVITATION' | 'GIFT_INVITATION';

export interface ReasonRegistration {
  type: ReasonRegistrationType;
  id?: string;
}

export interface Registration {
  email: string;
  name: string;
  over18: boolean;
  password: string;
  registrationInfo: {
    url: string;
    reason?: ReasonRegistration;
  };
  surnames: string;
  notificationLanguage?: string;
  refCode?: string;
  companySlug?: string;
}
