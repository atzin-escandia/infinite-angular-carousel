import { Component, Input } from '@angular/core';
import { RestrictionDTO } from '../../interfaces';
import { DEFAULT_RESTRICTIONS } from '../ec-drawer-modal-wrapper/constant/min-limits.constant';
import { EMPTY_SUMMARY_IMG } from './constants/empty-summary-img.constant';

@Component({
  selector: 'ec-empty-summary',
  templateUrl: './ec-empty-summary.component.html',
  styleUrls: ['./ec-empty-summary.component.scss'],
})
export class EcEmptySummaryComponent {
  @Input() set restrictions(newValue: RestrictionDTO) {
    const restrictions = newValue || DEFAULT_RESTRICTIONS;

    this.minElements = restrictions.minimumArticles;
    this.minPrice = restrictions.minimumPVP;
  }

  emptyImg = EMPTY_SUMMARY_IMG;
  minElements = 0;
  minPrice = 0;
}
