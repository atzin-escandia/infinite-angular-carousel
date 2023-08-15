import { Injectable } from '@angular/core';
import { ICGCart } from '../../interfaces/cart.interface';
import { UnknownObjectType } from '@app/interfaces';

@Injectable()
export class CrowdgivingCartService {
  mapProducts(products: UnknownObjectType[]): ICGCart[] {
    return products.map((product) => ({
      masterBox: product._masterBox,
      up: product._up,
      numMasterBoxes: product.numMasterBoxes,
      selectedDate: product.availableDates?.[0],
      type: 'OVERHARVEST',
    }));
  }
}
