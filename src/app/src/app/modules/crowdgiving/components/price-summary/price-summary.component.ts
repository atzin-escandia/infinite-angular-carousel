import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AtomicModule } from '@app/components/_atomic/atomic.module';
import { CurrencyType } from '@app/constants/app.constants';
import { SharedModule } from '@app/modules/shared/shared.module';

@Component({
  standalone: true,
  selector: 'app-cg-price-summary',
  templateUrl: './price-summary.component.html',
  styleUrls: ['./price-summary.component.scss'],
  imports: [CommonModule, SharedModule, AtomicModule],
})
export class CrowdgivingPriceSummaryComponent {
  @Input() price: number;
  @Input() currency: CurrencyType;
  @Input() credits: number;
}
