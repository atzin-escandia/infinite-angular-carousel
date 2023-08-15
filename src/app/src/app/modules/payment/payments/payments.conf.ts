export const STRIPE_CARD_INPUT_STYLES = {
  base: {
    color: '#32325d',
    fontFamily: '"Montserrat", Helvetica, sans-serif',
    fontSmoothing: 'antialiased',
    fontSize: '16px',
    '::placeholder': {
      fontFamily: '"Montserrat", Helvetica, sans-serif',
      color: 'rgba(0,0,0,.38)',
      fontSize: '16px',
    },
  },
  invalid: {
    color: '#fa755a',
    iconColor: '#fa755a',
    fontSize: '14px',
  },
};

export const STRIPE_CARD_SELECT_STYLES = {
  ...STRIPE_CARD_INPUT_STYLES,
  base: {
    ...STRIPE_CARD_INPUT_STYLES.base,
    padding: '14px 6px 14px 16px',
  },
};
