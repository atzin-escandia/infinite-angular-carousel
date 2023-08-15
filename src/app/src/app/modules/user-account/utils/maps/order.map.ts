import { IOrderStatusParams, RolePermission } from '../../interfaces/order.interface';
import {
  ORDER_DELIVERY_STATUS,
  ORDER_PAYMENT_STATUS,
  ORDER_STATUS,
  ORDER_TICKET_STATUS,
  ORDER_TYPE,
  ORDER_SECTION_TYPE,
  ORDER_STATUS_TRANSLATIONS,
  SUBSCRIPTION_STATUS,
  SUBSCRIPTION_STATUS_TRANSLATIONS,
  PURCHASE_ROLE,
  ORDER_TYPES,
  GIFT_STATUS,
} from '../../../../constants/order.constants';
import { PRODUCT_TYPE } from '@app/constants/product.constants';

export type OrderStatusDetailColorType = 'blue' | 'green' | 'red' | 'yellow';
export type OrdersSection = ORDER_SECTION_TYPE.GROUP_ORDER | ORDER_SECTION_TYPE.INDIVIDUAL_ORDERS | ORDER_SECTION_TYPE.SUBSCRIPTION_ORDERS;

const ORDER_TICKET_STATUS_MAP: Map<ORDER_TICKET_STATUS, ORDER_STATUS> = new Map([
  [ORDER_TICKET_STATUS.ORDER_TICKET_CLOSED, ORDER_STATUS.CLOSED_INCIDENT],
  [ORDER_TICKET_STATUS.ORDER_TICKET_OPENED, ORDER_STATUS.OPEN_INCIDENT],
]);

const ORDER_PAYMENT_STATUS_MAP: Map<ORDER_PAYMENT_STATUS, ORDER_STATUS> = new Map([
  [ORDER_PAYMENT_STATUS.ORDER_CANCELLED, ORDER_STATUS.CANCELLED],
  [ORDER_PAYMENT_STATUS.ORDER_COLLECTED, ORDER_STATUS.PLANNED],
  [ORDER_PAYMENT_STATUS.ORDER_DECLINED, ORDER_STATUS.REJECTED],
  [ORDER_PAYMENT_STATUS.ORDER_REJECTED, ORDER_STATUS.REJECTED],
  [ORDER_PAYMENT_STATUS.TRANSFER_PAYMENT, ORDER_STATUS.PLANNED],
  [ORDER_PAYMENT_STATUS.ORDER_PARTIALLY_REFUNDED, ORDER_STATUS.PLANNED],
  [ORDER_PAYMENT_STATUS.ORDER_REFUNDED, ORDER_STATUS.CANCELLED],
]);

const ORDER_PAYMENT_DETAIL_STATUS_MAP: Map<ORDER_PAYMENT_STATUS, any> = new Map([
  [ORDER_PAYMENT_STATUS.ORDER_CANCELLED, ORDER_STATUS.CANCELLED],
  [ORDER_PAYMENT_STATUS.ORDER_COLLECTED, ORDER_STATUS.PAID],
  [ORDER_PAYMENT_STATUS.ORDER_PAID, ORDER_STATUS.PAID],
  [ORDER_PAYMENT_STATUS.ORDER_DECLINED, ORDER_STATUS.REJECTED],
  [ORDER_PAYMENT_STATUS.ORDER_REJECTED, ORDER_STATUS.REJECTED],
  [ORDER_PAYMENT_STATUS.TRANSFER_PAYMENT, ORDER_STATUS.PAID],
  [ORDER_PAYMENT_STATUS.ORDER_PARTIALLY_REFUNDED, ORDER_STATUS.PLANNED],
  [ORDER_PAYMENT_STATUS.ORDER_REFUNDED, ORDER_STATUS.REFUNDED],
]);

const ORDER_DELIVERY_STATUS_MAP: Map<ORDER_DELIVERY_STATUS, ORDER_STATUS> = new Map([
  [ORDER_DELIVERY_STATUS.ORDER_LOGISTIC_SHIPPING_CANCELLED, ORDER_STATUS.PLANNED],
  [ORDER_DELIVERY_STATUS.ORDER_PENDING, ORDER_STATUS.PLANNED],
  [ORDER_DELIVERY_STATUS.ORDER_LOGISTICS_INFO_SENT, ORDER_STATUS.IN_PREPARATION],
  [ORDER_DELIVERY_STATUS.ORDER_SCANNED, ORDER_STATUS.IN_PREPARATION],
  [ORDER_DELIVERY_STATUS.ORDER_PREPARED, ORDER_STATUS.SENT],
  [ORDER_DELIVERY_STATUS.ORDER_IN_TRANSIT, ORDER_STATUS.SENT],
  [ORDER_DELIVERY_STATUS.ORDER_IN_TRANSIT_DELAYED, ORDER_STATUS.POSSIBLE_DELAY],
  [ORDER_DELIVERY_STATUS.ORDER_DELIVERY_POINT, ORDER_STATUS.DELIVERED],
  [ORDER_DELIVERY_STATUS.ADOPTED, ORDER_STATUS.ADOPTED],
  [ORDER_DELIVERY_STATUS.ORDER_DELIVERED, ORDER_STATUS.DELIVERED],
  [ORDER_DELIVERY_STATUS.ORDER_DELIVERY_ERROR, ORDER_STATUS.POSSIBLE_DELAY],
  [ORDER_DELIVERY_STATUS.UNKNOWN, ORDER_STATUS.POSSIBLE_DELAY],
]);

const ORDER_STATUS_DETAIL_COLORS_MAP: Map<ORDER_STATUS, OrderStatusDetailColorType> = new Map([
  [ORDER_STATUS.PLANNED, 'blue'],
  [ORDER_STATUS.IN_PREPARATION, 'blue'],
  [ORDER_STATUS.SENT, 'blue'],
  [ORDER_STATUS.POSSIBLE_DELAY, 'yellow'],
  [ORDER_STATUS.DELIVERED, 'green'],
  [ORDER_STATUS.OPEN_INCIDENT, 'yellow'],
  [ORDER_STATUS.CLOSED_INCIDENT, 'green'],
  [ORDER_STATUS.CANCELLED, 'red'],
  [ORDER_STATUS.REJECTED, 'red'],
  [ORDER_STATUS.DECLINED, 'red'],
]);

export const ORDER_STATUS_KEY_MAP: Map<string, ORDER_STATUS> = new Map([
  [ORDER_STATUS_TRANSLATIONS.adopted, ORDER_STATUS.ADOPTED],
  [ORDER_STATUS_TRANSLATIONS.cancelled, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS_TRANSLATIONS.closed_incident, ORDER_STATUS.CLOSED_INCIDENT],
  [ORDER_STATUS_TRANSLATIONS.declined, ORDER_STATUS.DECLINED],
  [ORDER_STATUS_TRANSLATIONS.delivered, ORDER_STATUS.DELIVERED],
  [ORDER_STATUS_TRANSLATIONS.in_preparation, ORDER_STATUS.IN_PREPARATION],
  [ORDER_STATUS_TRANSLATIONS.open_incident, ORDER_STATUS.OPEN_INCIDENT],
  [ORDER_STATUS_TRANSLATIONS.planned, ORDER_STATUS.PLANNED],
  [ORDER_STATUS_TRANSLATIONS.possible_delay, ORDER_STATUS.POSSIBLE_DELAY],
  [ORDER_STATUS_TRANSLATIONS.rejected, ORDER_STATUS.REJECTED],
  [ORDER_STATUS_TRANSLATIONS.sent, ORDER_STATUS.SENT],
]);

export const SUBSCRIPTION_STATUS_KEY_MAP: Map<string, SUBSCRIPTION_STATUS> = new Map([
  [SUBSCRIPTION_STATUS_TRANSLATIONS.IN_PROGRESS, SUBSCRIPTION_STATUS.IN_PROGRESS],
  [SUBSCRIPTION_STATUS_TRANSLATIONS.COMPLETED, SUBSCRIPTION_STATUS.COMPLETED],
  [SUBSCRIPTION_STATUS_TRANSLATIONS.CANCELLED, SUBSCRIPTION_STATUS.CANCELLED],
]);

export const ORDER_TYPE_TOGGLE_MAP: Map<ORDER_SECTION_TYPE, string> = new Map([
  [ORDER_SECTION_TYPE.INDIVIDUAL_ORDERS, 'page.individual-orders.tab'],
  [ORDER_SECTION_TYPE.GROUP_ORDER, 'page.group-orders.tab'],
  [ORDER_SECTION_TYPE.SUBSCRIPTION_ORDERS, 'global.recurrent-orders.tab'],
]);

export const ORDER_GENERATOR_TAG_MAP: Map<ORDER_STATUS, Partial<IOrderStatusParams>> = new Map([
  [
    ORDER_STATUS.CANCELLED,
    {
      orderPaymentStatus: ORDER_PAYMENT_STATUS.ORDER_CANCELLED,
      orderTicketStatus: ORDER_TICKET_STATUS.NONE,
    },
  ],
  [
    ORDER_STATUS.CLOSED_INCIDENT,
    {
      orderTicketStatus: ORDER_TICKET_STATUS.ORDER_TICKET_CLOSED,
    },
  ],
  [
    ORDER_STATUS.DECLINED,
    {
      orderPaymentStatus: ORDER_PAYMENT_STATUS.ORDER_DECLINED,
      orderTicketStatus: ORDER_TICKET_STATUS.NONE,
    },
  ],
  [
    ORDER_STATUS.DELIVERED,
    {
      orderDeliveryStatus: ORDER_DELIVERY_STATUS.ORDER_DELIVERED,
      orderTicketStatus: ORDER_TICKET_STATUS.NONE,
    },
  ],
  [
    ORDER_STATUS.IN_PREPARATION,
    {
      orderDeliveryStatus: ORDER_DELIVERY_STATUS.ORDER_LOGISTICS_INFO_SENT,
      orderTicketStatus: ORDER_TICKET_STATUS.NONE,
    },
  ],
  [
    ORDER_STATUS.OPEN_INCIDENT,
    {
      orderTicketStatus: ORDER_TICKET_STATUS.ORDER_TICKET_OPENED,
    },
  ],
  [
    ORDER_STATUS.PLANNED,
    {
      orderDeliveryStatus: ORDER_DELIVERY_STATUS.ORDER_PENDING,
      orderTicketStatus: ORDER_TICKET_STATUS.NONE,
    },
  ],
  [
    ORDER_STATUS.POSSIBLE_DELAY,
    {
      orderDeliveryStatus: ORDER_DELIVERY_STATUS.ORDER_IN_TRANSIT_DELAYED,
      orderTicketStatus: ORDER_TICKET_STATUS.NONE,
    },
  ],
  [
    ORDER_STATUS.REJECTED,
    {
      orderPaymentStatus: ORDER_PAYMENT_STATUS.ORDER_REJECTED,
      orderTicketStatus: ORDER_TICKET_STATUS.NONE,
    },
  ],
  [
    ORDER_STATUS.SENT,
    {
      orderDeliveryStatus: ORDER_DELIVERY_STATUS.ORDER_IN_TRANSIT,
      orderTicketStatus: ORDER_TICKET_STATUS.NONE,
    },
  ],
  [
    ORDER_STATUS.ADOPTED,
    {
      orderDeliveryStatus: ORDER_DELIVERY_STATUS.ADOPTED,
      orderTicketStatus: ORDER_TICKET_STATUS.NONE,
    },
  ],
  [
    ORDER_STATUS.REFUNDED,
    {
      orderPaymentStatus: ORDER_PAYMENT_STATUS.ORDER_REFUNDED,
      orderTicketStatus: ORDER_TICKET_STATUS.NONE,
    },
  ],
  [
    ORDER_STATUS.PAID,
    {
      orderPaymentStatus: ORDER_PAYMENT_STATUS.ORDER_PAID,
      orderTicketStatus: ORDER_TICKET_STATUS.NONE,
    },
  ],
]);

export const mapOrderStatus = (params: IOrderStatusParams | Partial<IOrderStatusParams>): ORDER_STATUS => {
  if (
    params.orderPaymentStatus &&
    params.orderPaymentStatus !==  ORDER_PAYMENT_STATUS.ORDER_PAID &&
    params.orderPaymentStatus !==  ORDER_PAYMENT_STATUS.ORDER_COLLECTED &&
    params.orderPaymentStatus !==  ORDER_PAYMENT_STATUS.ORDER_PENDING &&
    params.orderPaymentStatus !==  ORDER_PAYMENT_STATUS.ORDER_PARTIALLY_REFUNDED
  ) {
    return ORDER_PAYMENT_STATUS_MAP.get(params.orderPaymentStatus);
  } else if (params.orderDeliveryStatus) {
    if (params.orderType === ORDER_TYPE.ORDER_MULTI_SHOT_ADOPTION || params.orderType === ORDER_TYPE.ORDER_MULTI_SHOT_ADOPTION_RENEWAL) {
      return ORDER_DELIVERY_STATUS_MAP.get(ORDER_DELIVERY_STATUS.ADOPTED);
    } else {
      return ORDER_DELIVERY_STATUS_MAP.get(params.orderDeliveryStatus);
    }
  }
};

export const mapOrderTicket = (params: IOrderStatusParams | Partial<IOrderStatusParams>): ORDER_STATUS => {
  if (params.orderTicketStatus && params.orderTicketStatus !== ORDER_TICKET_STATUS.NONE) {
    return ORDER_TICKET_STATUS_MAP.get(params.orderTicketStatus);
  }
};

export const mapOrderPayment = (params: IOrderStatusParams): ORDER_STATUS => {
  if (params.orderPaymentStatus) {
    return ORDER_PAYMENT_DETAIL_STATUS_MAP.get(params.orderPaymentStatus);
  }
};

export const mapOrderStatusDetailColor = (status: any): any => {
  if (status.orderPaymentStatus === ORDER_PAYMENT_STATUS.ORDER_REJECTED || status.orderPaymentStatus === 'ORDER_DECLINED') {
    return ORDER_STATUS_DETAIL_COLORS_MAP.get(ORDER_STATUS.CANCELLED);
  } else if (status.orderTicketStatus === ORDER_TICKET_STATUS.ORDER_TICKET_OPENED) {
    return ORDER_STATUS_DETAIL_COLORS_MAP.get(ORDER_STATUS.OPEN_INCIDENT);
  } else if (status.orderTicketStatus === ORDER_TICKET_STATUS.ORDER_TICKET_CLOSED) {
    return ORDER_STATUS_DETAIL_COLORS_MAP.get(ORDER_STATUS.CLOSED_INCIDENT);
  } else if (
    status.orderDeliveryStatus === ORDER_DELIVERY_STATUS.ORDER_IN_TRANSIT_DELAYED ||
    status.orderDeliveryStatus === ORDER_DELIVERY_STATUS.UNKNOWN ||
    status.orderDeliveryStatus === ORDER_DELIVERY_STATUS.ORDER_DELIVERY_ERROR
  ) {
    return ORDER_STATUS_DETAIL_COLORS_MAP.get(ORDER_STATUS.POSSIBLE_DELAY);
  } else if (status.orderDeliveryStatus === ORDER_DELIVERY_STATUS.ORDER_DELIVERY_POINT) {
    return ORDER_STATUS_DETAIL_COLORS_MAP.get(ORDER_STATUS.DELIVERED);
  } else {
    return ORDER_STATUS_DETAIL_COLORS_MAP.get(ORDER_STATUS.PLANNED);
  }
};

// eslint-disable-next-line complexity
export const mapOrderStatusDetailMsg = (status: any, order: any): { id: string; replacements?: any } | null => {
  if (
    status.orderPaymentStatus === ORDER_PAYMENT_STATUS.ORDER_REJECTED ||
    status.orderPaymentStatus === ORDER_PAYMENT_STATUS.ORDER_DECLINED
  ) {
    return { id: 'page.payment-failed-inbox.body' };
  } else if (status.orderPaymentStatus === ORDER_PAYMENT_STATUS.ORDER_CANCELLED) {
    return null;
  } else if (status.orderTicketStatus === ORDER_TICKET_STATUS.ORDER_TICKET_OPENED && status.orderType === PRODUCT_TYPE.ECOMMERCE) {
    return { id: 'page.issue-order-personalized-box.text-info' };
  } else if (status.orderTicketStatus === ORDER_TICKET_STATUS.ORDER_TICKET_OPENED) {
    return { id: 'page-order-issue.body' };
  } else if (status.orderTicketStatus === ORDER_TICKET_STATUS.ORDER_TICKET_CLOSED) {
    if (order.ticket.resolution) {
      return {
        id: 'page.issue-resolved.body',
        replacements: { '{resolution}': order.ticket?.resolution?.publicDescription },
      };
    } else {
      return {
        id: 'page.issue-resolved.title',
      };
    }
  } else if (
    (status.orderDeliveryStatus === ORDER_DELIVERY_STATUS.UNKNOWN ||
      status.orderDeliveryStatus === ORDER_DELIVERY_STATUS.ORDER_DELIVERY_ERROR ||
      status.orderDeliveryStatus === ORDER_DELIVERY_STATUS.ORDER_IN_TRANSIT_DELAYED) &&
    status.orderType === PRODUCT_TYPE.ECOMMERCE
  ) {
    return {
      id: 'page.issue-order-personalized-box.text-info',
    };
  } else if (
    status.orderDeliveryStatus === ORDER_DELIVERY_STATUS.UNKNOWN ||
    status.orderDeliveryStatus === ORDER_DELIVERY_STATUS.ORDER_DELIVERY_ERROR
  ) {
    return {
      id: 'page.issue-order-notification.body',
    };
  } else if (
    status.orderDeliveryStatus === ORDER_DELIVERY_STATUS.ORDER_IN_TRANSIT_DELAYED ||
    status.orderDeliveryStatus === ORDER_DELIVERY_STATUS.ORDER_IN_TRANSIT ||
    status.orderDeliveryStatus === ORDER_DELIVERY_STATUS.ORDER_PREPARED
  ) {
    return { id: 'page.order-on-the-way.body' };
  } else if (status.orderDeliveryStatus === ORDER_DELIVERY_STATUS.ORDER_DELIVERY_POINT) {
    return { id: 'page-order-on-delivery-point.body' };
  } else if (
    status.orderDeliveryStatus === ORDER_DELIVERY_STATUS.ORDER_SCANNED ||
    status.orderDeliveryStatus === ORDER_DELIVERY_STATUS.ORDER_LOGISTICS_INFO_SENT
  ) {
    return { id: 'page.farmer-started-order.body' };
  }
};

export const mapRolePermissions = (role: PURCHASE_ROLE = PURCHASE_ROLE.DEFAULT, orderDetail: any): RolePermission => {
  const isGiftPending = orderDetail.gift?.status === GIFT_STATUS.PENDING;
  const isGiftCancelled =
    orderDetail.orderPaymentStatus === ORDER_PAYMENT_STATUS.ORDER_REFUNDED ||
    orderDetail.orderPaymentStatus === ORDER_PAYMENT_STATUS.ORDER_CANCELLED ||
    orderDetail.orderPaymentStatus === ORDER_PAYMENT_STATUS.ORDER_REJECTED;

  const defaultRolePermissions: RolePermission = {
    openIncident: true,
    changeDelivery: true,
    changeAddress: true,
    planShipment: true,
    cancelOrder: true,
    logisticStatus: true,
    showFullAddress: true,
    showPaymentInfo: true,
    showNewShipmentOrders: true,
    showReceipts: true,
    typeOfOrder: ORDER_TYPES.INDIVIDUAL_ORDERS,
    nameOfRole: PURCHASE_ROLE.DEFAULT,
  };

  const PERMISSIONS: object = {
    PROMOTER: {
      ...defaultRolePermissions,
      nameOfRole: PURCHASE_ROLE.PROMOTER,
      typeOfOrder: ORDER_TYPES.GROUP_ORDERS,
    },

    GUEST: {
      ...defaultRolePermissions,
      nameOfRole: PURCHASE_ROLE.GUEST,
      typeOfOrder: ORDER_SECTION_TYPE.GROUP_ORDER,
      openIncident: false,
      changeDelivery: false,
      changeAddress: false,
      showFullAddress: false,
      showPaymentInfo: false,
      showNewShipmentOrders: false,
      showReceipts: false,
    },

    RECIPIENT: {
      ...defaultRolePermissions,
      nameOfRole: PURCHASE_ROLE.RECIPIENT,
      typeOfOrder: ORDER_TYPES.ADOPTION_GIFT_ORDERS,
      showPaymentInfo: false,
    },

    GIFTER: {
      ...defaultRolePermissions,
      nameOfRole: PURCHASE_ROLE.GIFTER,
      typeOfOrder: ORDER_TYPES.ADOPTION_GIFT_ORDERS,
      openIncident: false,
      changeDelivery: false,
      changeAddress: false,
      logisticStatus: isGiftCancelled,
      showFullAddress: isGiftPending,
      showNewShipmentOrders: false,
      planShipment: false,
    },

    DEFAULT: {
      ...defaultRolePermissions,
    },
  };

  return PERMISSIONS[role];
};
