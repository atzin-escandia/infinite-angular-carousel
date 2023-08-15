import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Seal, SealsCategory } from '@app/interfaces';
import { SealsManagerService } from '@app/modules/e-commerce/services/seals-services';
import {ArticleDTO} from '@app/modules/e-commerce/interfaces';

@Component({
  selector: 'cf-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss'],
})
export class ProductsListComponent implements OnChanges {
  @Input() products: ArticleDTO[];
  @Input() allSeals: Seal[];

  productsData: ArticleDTO[];

  constructor(private sealsManagerSrv: SealsManagerService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.allSeals.currentValue?.length) {
      this.productsData = this.products.map((product) => {
        const seals = this.sealsManagerSrv.getProjectSeals(changes.allSeals.currentValue, (product.seals as SealsCategory).up);

        product.headerSeals = this.sealsManagerSrv.getDetailSeals(seals);

        return product;
      });
    }
  }
}
