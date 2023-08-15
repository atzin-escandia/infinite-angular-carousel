import { UnknownObjectType } from '@app/interfaces';
import { ISubscriptionConfiguration } from '@app/interfaces/subscription.interface';

export interface IProductUpdateParams {
  cartItem: UnknownObjectType;
  product?: UnknownObjectType;
  subsConfig?: ISubscriptionConfiguration;
  isRefresh?: boolean;
}

export interface IProductsInfoTotal {
  amount: number;
  amountToPay?: number;
  creditsToSpend?: number;
}
