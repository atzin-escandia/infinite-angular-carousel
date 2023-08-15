import {PAYMENT_METHOD} from '../modules/purchase/constants/payment-method.constants';

const PAYMENT_INFO_KEY: Map<string, PAYMENT_METHOD> = new Map([
  ['cardInfo', PAYMENT_METHOD.CARD],
  ['idealInfo', PAYMENT_METHOD.IDEAL],
  ['sepaInfo', PAYMENT_METHOD.SEPA],
  ['paypalInfo', PAYMENT_METHOD.PAYPAL],
]);

export const MAPTO_PAYMENT_METHOD = {
  PAYMENT_INFO_KEY
};
