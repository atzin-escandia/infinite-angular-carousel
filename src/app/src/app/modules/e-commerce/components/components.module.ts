import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EcInfoBannerComponent } from './ec-info-banner/ec-info-banner.component';
import { SharedModule } from '@app/modules/shared/shared.module';
import { TranslocoModule } from '@ngneat/transloco';
import { EcButtonComponent } from './ec-button/ec-button.component';
import { EcDrawerModalWrapperComponent } from './ec-drawer-modal-wrapper/ec-drawer-modal-wrapper.component';
import { EcItemSummaryComponent } from './ec-item-summary/ec-item-summary.component';
import { BaseCardModule, ImagesMosaicModule } from '@app/components';
import { EcListSummaryComponent } from './ec-list-summary/ec-list-summary.component';
import { EcEmptySummaryComponent } from './ec-empty-summary/ec-empty-summary.component';
import { EcDetailSummaryComponent } from './ec-detail-summary/ec-detail-summary.component';
import { EcDetailInfoComponent } from './ec-detail-info/ec-detail-info.component';
import { SealElementModule } from '@app/components/seal-component/seal-element.module';
import { EcCatalogGridComponent } from './ec-catalog-grid/ec-catalog-grid.component';
import { EcCardComponent } from './ec-card/ec-card.component';
import { EcSkeletonCardComponent } from './ec-skeletons/ec-skeleton-card/ec-skeleton-card.component';
import { EcDetailSkeletonComponent } from './ec-skeletons/ec-detail-skeleton/ec-detail-skeleton.component';

@NgModule({
  declarations: [
    EcInfoBannerComponent,
    EcButtonComponent,
    EcDrawerModalWrapperComponent,
    EcItemSummaryComponent,
    EcListSummaryComponent,
    EcEmptySummaryComponent,
    EcDetailSummaryComponent,
    EcDetailInfoComponent,
    EcCatalogGridComponent,
    EcCardComponent,
    EcSkeletonCardComponent,
    EcDetailSkeletonComponent,
  ],
  exports: [
    EcInfoBannerComponent,
    EcButtonComponent,
    EcDrawerModalWrapperComponent,
    EcItemSummaryComponent,
    EcListSummaryComponent,
    EcDetailSummaryComponent,
    EcDetailInfoComponent,
    EcCatalogGridComponent,
    EcCardComponent,
    EcSkeletonCardComponent,
    EcDetailSkeletonComponent,
  ],
  imports: [CommonModule, SharedModule, TranslocoModule, ImagesMosaicModule, SealElementModule, BaseCardModule],
})
export class ComponentsModule {}
