import { UnknownObjectType } from './common.interface';

export interface ICrossSellingParams {
  limit: number;
  products?: UnknownObjectType[];
  country?: string;
  user?: string;
}

export interface ICrossSellingSpecifications {
  crossSellingSB: ICrossSellingSpecificationData;
  ohProjects: ICrossSellingSpecificationData;
  adoptionProjects: ICrossSellingSpecificationData;
  trackingActionName: string;
}

export interface ICrossSellingSpecificationData {
  header: string;
  trackingListName: string;
  trackingGA4ListName: string;
}

export interface ICrossSellingProjectParams {
  purchaseType: string;
  up: IProjectParamsUp;
  name: string;
  upCf: string;
  masterBox: string;
  quantity: IProjectQuantity;
  uberUp: string;
  farmerSlug: string;
  flags: IProjectFlags;
}

interface IProjectParamsUp {
  _id: string;
  _m_up: string;
  _m_slug: string;
}

interface IProjectQuantity {
  numMasterBoxes: number;
  mbLeft: number;
  stepMS: IProjectQuantityStepMS[];
}

interface IProjectQuantityStepMS {
  _productId: string;
  quantity: number;
}

interface IProjectFlags {
  oneShot: boolean;
  multiShot: boolean;
  uberUp: boolean;
}
