import {SelectOption} from '../../interfaces/select.interface';

export interface SubscriptionOptions {
  dates: string[];
  frequencies: SelectOption[];
}

export interface SubscriptionOptionsSelected {
  date: string | null;
  frequency: SelectOption | null;
}
