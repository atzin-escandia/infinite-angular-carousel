import { ArticleDTO } from '@app/modules/e-commerce/interfaces';
import { ShipmentDTO } from './shipmentDTO.interface';
import { INotification } from '@app/interfaces/notification.interface';
import { ORDER_DELIVERY_STATUS, ORDER_PAYMENT_STATUS, ORDER_TICKET_STATUS, ORDER_TYPE } from '@app/constants/order.constants';
import { UnknownObjectType } from '@app/interfaces';

export interface OrderCustomBox {
  _id: string;
  orderNumber?: string;
  notifications?: INotification[];
  orderDeliveryStatus?: ORDER_DELIVERY_STATUS;
  orderPaymentStatus?: ORDER_PAYMENT_STATUS;
  orderTicketStatus?: ORDER_TICKET_STATUS;
  orderType?: ORDER_TYPE;
  amount?: AmountDTO;
  paymentMethods?: OrderPaymentMethodDTO;
  platform?: string;
  articles?: ArticleDTO[];
  products?: [ArticleDTO[]];
  shipment?: ShipmentDTO;
  currency?: FarmerCurrency;
  dedicatoryMsg?: string;
  lapiInfo?: LapiInfo;
  registerDate?: string;
  createdAt?: string;
}

interface LapiInfo {
  providerUrl: string[];
  providerPublicName: string[];
}

export interface OrderPaymentMethodDTO {
  crowdfarmer?: UnknownObjectType;
}

export interface AmountDTO {
  totalToCollect: number;
  totalToTransfer?: number;
}

interface FarmerCurrency {
  crowdfarmer?: {
    currency?: string;
    rate?: number;
    symbol?: string;
  };
}
