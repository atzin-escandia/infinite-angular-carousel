import { IAllowedPaymentMethods } from '@app/interfaces';

export const NOT_VALID_COUNTRY_ERROR = 'Invalid country required for discovery box';

export const DEFAULT_UNAVAILABLE_IMG = '../../../../../assets/img/e-commerce/unavailable/not_available.svg';

export const SB_ALLOWED_PAYMENT_METHODS: IAllowedPaymentMethods = {
  card: true,
  ideal: false,
  sepa: false,
  paypal: true,
  applePay: false,
  klarna: false,
};

export const DISCOVERY_BOX_VALID_COUNTRIES = ['de', 'es', 'at'];

export const DISCOVERY_BOX_FIREBASE_PARAMS = 'discoveryBoxActiveParams';
