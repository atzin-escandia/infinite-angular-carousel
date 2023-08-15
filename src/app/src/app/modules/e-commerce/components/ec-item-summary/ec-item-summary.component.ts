import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { ImagesDTO } from '@app/components/images-mosaic/interfaces/images-dto';
import { ArticleDTO } from '../../interfaces';
import { ParseArticlesService } from '../../services/parse-articles/parse-articles.service';

@Component({
  selector: 'ec-item-summary',
  templateUrl: './ec-item-summary.component.html',
  styleUrls: ['./ec-item-summary.component.scss'],
})
export class EcItemSummaryComponent {
  /**
   * item
   */
  item: ArticleDTO;

  /**
   * unitSize
   */
  unitSize: string;

  /**
   * images
   */
  images: ImagesDTO[] = [];

  counter: number;

  /**
   * Summary item
   */
  @Input() set itemData(newValue: ArticleDTO) {
    this.item = newValue;
    this.counter = this.item.quantity;

    this.setImages();
  }

  @Input() set quantity(newValue: number) {
    this.counter = newValue;
  }

  /**
   * isOpened
   */
  @Input() set isOpened(newValue: boolean) {
    if (newValue) {
      this.setImages();
    }
  }

  @Output() quantityChange = new EventEmitter<ArticleDTO>();

  @Output() deleteItem = new EventEmitter<number>();

  constructor(private parseArticlesSrv: ParseArticlesService, private cdr: ChangeDetectorRef) {}

  /**
   * Transform images to format mosaic images
   *
   * @param images
   * @param isUnavailable
   */
  setImages(): void {
    const images = this.item.imgUrl ? [this.item.imgUrl] : [''];

    if (images?.length) {
      this.images = images.map((img: string) => ({
        src: img,
        available: !this.item.isUnavailable && !this.item.isNotSharedDate,
      }));
    }
  }

  changeQuantity(): void {
    if (this.item.quantity < this.counter && !this.parseArticlesSrv.checkMaxWeighShoppingList(this.item)) {
      this.parseArticlesSrv.showMaxWeightRestriction();
      setTimeout(() => {
        this.counter = this.counter - 1;
      }, 0);
    } else {
      this.item.quantity = this.counter;
      this.quantityChange.emit(this.item);
    }
  }

  resetQuantity(): void {
    this.counter = 0;
    this.item.quantity = this.counter;
    this.quantityChange.emit(this.item);
  }

  delete(id: number): void {
    this.deleteItem.emit(id);
  }
}
