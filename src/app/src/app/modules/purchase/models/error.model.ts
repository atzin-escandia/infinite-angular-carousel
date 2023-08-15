import { UnknownObjectType } from '@app/interfaces';

type ErrorName =
  | 'UNEXPECTED_ERROR'
  | 'ADDRESS_ERROR'
  | 'APPLE_PAY_ERROR'
  | 'SEPA_ERROR'
  | 'CARD_ERROR'
  | 'IDEAL_ERROR'
  | 'PAYPAL_ERROR'
  | 'KLARNA_ERROR'
  | 'GROUP_ORDER_ERROR'
  | 'CHECKOUT_SECTION_CART_ERROR'
  | 'CHECKOUT_SECTION_SHIPMENT_ERROR'
  | 'CHECKOUT_SECTION_PAYMENT_ERROR'
  | 'STRIPE_CALLBACK_ERROR'
  | 'STRIPE_INTENT_ERROR'
  | 'CART_ERROR'
  | 'ORDER_ERROR';

interface IPurchaseError {
  name: ErrorName;
  message: string;
  cause?: any;
  displayErrorMessage?: string;
  data?: UnknownObjectType;
}

export class PurchaseError implements IPurchaseError {
  name: ErrorName;
  message: string;
  context: 'purchase';
  cause?: any;
  displayErrorMessage?: string;
  data?: UnknownObjectType;

  constructor({ name, message, cause, displayErrorMessage, data }: IPurchaseError) {
    this.name = name;
    this.message = message;
    this.context = 'purchase';

    if (cause) {
      this.cause = this.getCause(cause);
    }

    if (displayErrorMessage) {
      this.displayErrorMessage = displayErrorMessage;
    }

    if (data) {
      this.data = this.getData(data);
    }
  }

  private getCause(cause: any = {}): any {
    const { type, code } = cause;

    if (type && code) {
      return { type, code };
    }

    return cause;
  }

  private getData(data: any = {}): any {
    const { stripeIntent } = data;

    if (stripeIntent) {
      const { id, customer } = stripeIntent;

      return { id, customer };
    }

    return data;
  }
}
