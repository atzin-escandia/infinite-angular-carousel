import { IAddress } from '@app/interfaces';
import { DescPerLangsDTO } from '@app/modules/e-commerce/interfaces';

export interface ShipmentDTO {
  address?: IAddress;
  shipperMessage?: string;
  sendDate?: string;
  arrivalEstimateDate?: string;
  originalArrivalEstimateDate?: string;
  boxes?: BoxDTO;
  delayed?: boolean;
}

interface BoxDTO {
  _boxId: string;
  products?: {
    _m_title?: DescPerLangsDTO;
    amount: number;
  }[];
  sent?: boolean;
  deliveryPoint?: boolean;
  delivered?: boolean;
  scanned?: boolean;
  prepared?: boolean;
}
