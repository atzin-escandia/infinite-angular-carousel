import { IOrderPayment } from '@app/interfaces/order.interface';
import { ICGCart } from './cart.interface';

export interface ICGOrder {
  crowdgiving: ICGOrderCrowdgiving;
  cart: ICGCart[];
  paymentMethod: IOrderPayment;
  price: number;
}

export interface ICGOrderCrowdgiving {
  id: string;
  country: string;
}
