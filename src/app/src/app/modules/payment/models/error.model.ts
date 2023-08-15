import { UnknownObjectType } from '@app/interfaces';

type ErrorName =
  | 'PAYMENT_ERROR'
  | 'CARD_ERROR'
  | 'PAYPAL_ERROR'
  | 'STRIPE_CALLBACK_ERROR'
  | 'STRIPE_INTENT_ERROR'
  | 'CART_ERROR'
  | 'UNEXPECTED_ERROR';

interface IPaymentError {
  name: ErrorName;
  message: string;
  cause?: any;
  displayErrorMessage?: string;
  data?: UnknownObjectType;
}

export class PaymentError implements IPaymentError {
  name: ErrorName;
  message: string;
  context: 'payment';
  cause?: any;
  displayErrorMessage?: string;
  data?: UnknownObjectType;

  constructor({ name, message, cause, displayErrorMessage, data }: IPaymentError) {
    this.name = name;
    this.message = message;
    this.context = 'payment';

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
