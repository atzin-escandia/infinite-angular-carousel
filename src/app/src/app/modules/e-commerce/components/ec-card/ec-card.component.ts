import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { HeaderSeal, ProjectSeals, Seal } from '@app/interfaces';
import { ArticleDTO } from '../../interfaces';
import { SealsManagerService } from '../../services/seals-services';
import { ParseArticlesService } from '../../services/parse-articles/parse-articles.service';

@Component({
  selector: 'ec-card',
  styleUrls: ['./ec-card.component.scss'],
  templateUrl: './ec-card.component.html',
})
export class EcCardComponent implements OnChanges {
  articleData: ArticleDTO;
  minPrice: number;
  seals: HeaderSeal[];
  counter: number;

  @Input() set article(newValue: ArticleDTO) {
    this.articleData = newValue;
    this.minPrice = newValue.totalPrice;
  }

  @Input() set quantity(newValue: number) {
    this.counter = newValue;
  }

  @Input() allSeals: any;

  @Output() changeQuantity = new EventEmitter<ArticleDTO>();

  @Output() clickEv = new EventEmitter<any>();

  constructor(
    private sealsManagerSvr: SealsManagerService,
    private parseArticlesSrv: ParseArticlesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.article?.currentValue && changes.allSeals?.currentValue) {
      this.setSeals(changes.allSeals.currentValue);
    }
  }

  setSeals(seals: Seal[]): void {
    const selectedSeals: Seal[] = this.sealsManagerSvr.getProjectSeals(seals, this.articleData.seals as ProjectSeals[]);

    this.seals = this.sealsManagerSvr.getDetailSeals(selectedSeals);
  }

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
