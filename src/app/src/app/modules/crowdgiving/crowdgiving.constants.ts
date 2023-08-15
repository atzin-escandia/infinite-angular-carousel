import {IAllowedPaymentMethods} from '@app/interfaces';
import { ICrowdgivingSection } from './interfaces/crowdgiving.interface';

export const CG_SECTIONS: ICrowdgivingSection[] = [
  { key: 'ngos', label: 'ngos', path: 'ngos' },
  { key: 'products', label: 'products', path: 'products' },
  { key: 'payment', label: 'payment', path: 'payment' },
];

export const CG_ALLOWED_PAYMENT_METHODS: IAllowedPaymentMethods = {
  card: true,
  ideal: false,
  sepa: false,
  paypal: true,
  applePay: false,
  klarna: false,
};
