import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ICGProductMapTo } from '../../interfaces/product.interface';
import { CrowdgivingNgoCardComponent } from '../ngo-card/ngo-card.component';
import { CrowdgivingProductCardComponent } from '../product-card/product-card.component';
import { AtomicModule } from '@app/components/_atomic/atomic.module';
import { INGO } from '../../interfaces/ngo.interface';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  standalone: true,
  selector: 'app-crowdgiving-summary',
  templateUrl: './crowdgiving-summary.component.html',
  styleUrls: ['./crowdgiving-summary.component.scss'],
  imports: [CommonModule, TranslocoModule, AtomicModule, CrowdgivingNgoCardComponent, CrowdgivingProductCardComponent]
})
export class CrowdgivingSummaryComponent {
  @Input() selectedNgo: INGO;
  @Input() selectedProducts: ICGProductMapTo[] = [];
}
