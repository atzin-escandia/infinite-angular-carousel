import { Component, Input } from '@angular/core';
import { ArticleDTO } from '@app/modules/e-commerce/interfaces';

@Component({
  selector: 'cf-product-item',
  templateUrl: './product-item.component.html',
  styleUrls: ['./product-item.component.scss'],
})
export class ProductItemComponent {
  @Input() last: boolean;

  @Input() set product(newValue: ArticleDTO | undefined) {
    this.productData = newValue;
    this.images = [newValue.imgUrl];
  }

  productData: ArticleDTO;
  images: string[];
}
