import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { HeaderSeal } from '@app/interfaces';
import { ArticleDTO } from '../../interfaces';
import { ParseArticlesService } from '../../services/parse-articles/parse-articles.service';

@Component({
  selector: 'ec-detail-summary',
  templateUrl: './ec-detail-summary.component.html',
  styleUrls: ['./ec-detail-summary.component.scss'],
})
export class EcDetailSummaryComponent {
  articleData: ArticleDTO;
  minPrice: number;
  counter: number;

  @Input() set article(newValue: ArticleDTO) {
    this.articleData = newValue;
    this.minPrice = newValue.totalPrice;
  }

  @Input() set quantity(newValue: number) {
    this.counter = newValue;
  }

  @Input() seals: HeaderSeal[];

  @Output() changeQuantity = new EventEmitter<ArticleDTO>();

  constructor(private parseArticlesSrv: ParseArticlesService, private cdr: ChangeDetectorRef) {}

  selectQuantityArticle(quantity: number): void {
    const article: ArticleDTO = {
      ...this.articleData,
      quantity,
    };

    this.articleData.quantity = this.articleData.quantity || 0;

    if (this.articleData.quantity < quantity && !this.parseArticlesSrv.checkMaxWeighShoppingList(article)) {
      this.parseArticlesSrv.showMaxWeightRestriction();
      setTimeout(() => {
        this.counter = this.counter - 1;
      }, 0);
    } else {
      this.changeQuantity.emit(article);
    }
  }
}
