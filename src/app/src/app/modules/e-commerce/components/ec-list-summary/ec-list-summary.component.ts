import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ArticleDTO } from '../../interfaces';
import { MultiLangTranslationPipe } from '@app/pipes/multilang-translation';
import { RouterService } from '@app/services';
import { E_COMMERCE_ROUTES } from '../../constant/routes.constant';
import { ParseArticlesService } from '../../services/parse-articles/parse-articles.service';

@Component({
  selector: 'ec-list-summary',
  templateUrl: './ec-list-summary.component.html',
  styleUrls: ['./ec-list-summary.component.scss'],
})
export class EcListSummaryComponent {
  /**
   * item list
   */
  @Input() itemList: ArticleDTO[] = [];

  /**
   * isOpened
   */
  @Input() isOpened: boolean;

  @Output() changeArticle = new EventEmitter<ArticleDTO>();

  @Output() selectArticle = new EventEmitter<void>();

  /**
   * routes
   */
  routes = E_COMMERCE_ROUTES;

  constructor(
    private multiTranslation: MultiLangTranslationPipe,
    private routerSrv: RouterService,
    private parseArticlesSrv: ParseArticlesService
  ) {}

  changeItem(item: ArticleDTO): void {
    this.changeArticle.emit(item);
  }

  goToDetail(e: Event, article: ArticleDTO): void {
    e.preventDefault();

    const detailPath = `${this.multiTranslation.transform(article._m_nameDetail || article._m_detailTitle)}`;

    this.selectArticle.emit();

    this.routerSrv.navigateToEcommerce(this.parseArticlesSrv.parseDetailRoute(detailPath));
  }
}
