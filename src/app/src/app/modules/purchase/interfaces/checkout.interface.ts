export type CheckoutSectionPathType = 'cart' | 'shipment' | 'payment';

export interface ICheckoutSection {
  label: string;
  path: CheckoutSectionPathType;
  icon: string;
}

export interface MaxBoxesPerAdoption {
  masterBox: string;
  totalBoxes: number;
  upCf?: string;
}
