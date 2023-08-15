import {Injectable} from '@angular/core';

import {BaseResource} from '../base';
import {ApiResource} from '../api';
import {Product} from '@interfaces/product.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductsResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  /**
   * Get product by id
   */
   public getById(id: string): Promise<Product> {
    return this.apiRsc.get({service: 'products/' + id});
  }
}
