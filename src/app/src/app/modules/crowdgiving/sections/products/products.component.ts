import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ICGProductMapTo } from '../../interfaces/product.interface';
import { CrowdgivingProductCardComponent } from '../../components/product-card/product-card.component';
import { CrowdgivingNgoCardComponent } from '../../components/ngo-card/ngo-card.component';
import { INGO } from '../../interfaces/ngo.interface';
import { CrowdgivingPriceSummaryComponent } from '../../components/price-summary/price-summary.component';
import { CrowdgivingCardComponent } from '../../components/card/card.component';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  standalone: true,
  selector: 'app-crowdgiving-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  imports: [
    CommonModule,
    TranslocoModule,
    CrowdgivingCardComponent,
    CrowdgivingNgoCardComponent,
    CrowdgivingProductCardComponent,
    CrowdgivingPriceSummaryComponent
  ]
})
export class CrowdgivingProductsComponent {
  @Input() selectedNgo: INGO;
  @Input() productsList: ICGProductMapTo[] = [];
  @Input() totalPrice: number;
  @Input() credits: number;
  @Input() selectedItemsIds: string[] = [];

  @Output() selectedItemsQuantityChange = new EventEmitter<{ quantity: number; id: string }>();
  @Output() selectedItemsIdsChange = new EventEmitter<string[]>();

  isSelected(id: string): boolean {
    return this.selectedItemsIds.includes(id);
  }

  quantityChangeHandler(quantity: number, id: string): void {
    this.selectedItemsQuantityChange.emit({ quantity, id });
  }

  onOptionSelect(id: string): void {
    const emitData = this.selectedItemsIds.includes(id) ?
      this.selectedItemsIds.filter((elem) => elem !== id) :
      [...this.selectedItemsIds, id];

    this.selectedItemsIdsChange.emit(emitData);
  }
}
