import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ICGProductMapTo } from '../../interfaces/product.interface';
import { SharedModule } from '@app/modules/shared/shared.module';

@Component({
  standalone: true,
  selector: 'app-cg-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  imports: [CommonModule, SharedModule],
})
export class CrowdgivingProductCardComponent {
  @Input() product: ICGProductMapTo;
  @Input() showQuantityLabel: boolean;
  @Input() showQuantitySelector: boolean;
  @Input() quantity = 1;

  @Output() quantityChange = new EventEmitter<number>();

  onCounterChange(val: number): void {
    this.quantityChange.emit(val);
  }
}
