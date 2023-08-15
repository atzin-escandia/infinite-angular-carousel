import {
  ORDER_DELIVERY_STATUS,
  ORDER_PAYMENT_STATUS,
  ORDER_STATUS,
  ORDER_TICKET_STATUS,
  ORDER_TYPE,
  SUBSCRIPTION_STATUS,
} from '../../../constants/order.constants';

export interface ITagGroupOrder {
  type: ORDER_STATUS;
  affectedOrders: number;
}

export interface IOrderStatusParams {
  orderDeliveryStatus: ORDER_DELIVERY_STATUS;
  orderPaymentStatus: ORDER_PAYMENT_STATUS;
  orderTicketStatus: ORDER_TICKET_STATUS;
  orderType: ORDER_TYPE;
  subscription?: SUBSCRIPTION_STATUS;
}

export interface GOParticipant {
  id: string;
  email: string;
  name: string;
  surnames: string;
  individualAmountToPay: number;
}

export interface IGifOptions {
  name: string;
  email: string;
  date: string;
  message?: string;
  isSchedule: boolean;
  isPrivacy: boolean;
}

export interface IGift {
  _buyer: string;
  giftNumber: string;
  status: string;
  hash: string;
  updates: {
    status: string;
    date: string;
    text?: string;
  };
  giftOptions: IGifOptions;
  _upCf: string;
  _order: string;
  _payment: string;
  _recipient?: string;
  _season: string;
  notificationDate: string;
  cancellationDate: string;
}

export interface AccordionGift {
  header: {
    title?: string;
    gift?: {
      isGifter: boolean;
    };
  };
  body: AccordionGiftBody[];
}

export interface AccordionGiftBody {
  title: string;
  content: {
    info: string;
    extraInfo?: string;
    italic: boolean;
  };
}

export interface RolePermission {
  openIncident: boolean;
  changeDelivery: boolean;
  cancelOrder: boolean;
  changeAddress: boolean;
  planShipment: boolean;
  showFullAddress: boolean;
  showPaymentInfo: boolean;
  logisticStatus: boolean;
  showNewShipmentOrders: boolean;
  showReceipts: boolean;
  typeOfOrder: string;
  nameOfRole: string;
}
