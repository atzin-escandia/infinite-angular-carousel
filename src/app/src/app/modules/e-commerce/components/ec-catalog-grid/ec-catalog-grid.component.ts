import { Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { ArticleDTO } from '../../interfaces';

@Component({
  selector: 'ec-catalog-grid',
  templateUrl: './ec-catalog-grid.component.html',
  styleUrls: ['./ec-catalog-grid.component.scss'],
})
export class EcCatalogGridComponent {
  @ContentChild('card', { static: false }) cardTemplateRef: TemplateRef<any>;

  @Input() articlesList: ArticleDTO[];
}
