import { IAddress } from '@app/interfaces';

export const CROWDGIVING_ADDRESS_ID = 'CROWDGIVING';

export const CROWDGIVING_ADDRESS: { [key: string]: IAddress } = {
  PL: {
    name: 'Iwona',
    surnames: 'Wojtzaszek',
    phone: { prefix: '+34', number: '911988588' },
    street: 'Stanisława Bodycha',
    number: '97',
    details: 'Bank Żywności SOS w Warszawie',
    city: 'Reguły',
    province: 'Reguły',
    zip: '05820',
    country: 'pl',
  },
};

export const getCrowdgivingAddress = (key: 'PL'): IAddress => CROWDGIVING_ADDRESS[key];
