import { PAYMENT_METHOD } from '@app/interfaces';

export const PAYMENT_METHODS_MAP_TO_TEXT: Map<PAYMENT_METHOD, string> = new Map([
  [PAYMENT_METHOD.CARD, 'page.Credit-card.body'],
  [PAYMENT_METHOD.PAYPAL, 'global.paypal-account.label'],
]);
