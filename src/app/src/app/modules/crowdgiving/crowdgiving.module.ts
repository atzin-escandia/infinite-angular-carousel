import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CrowdgivingPageComponent } from './crowdgiving.component';
import { CrowdgivingPageService } from './crowdgiving.service';
import { CrowdgivingStoreService } from './store/store.service';
import { CrowdgivingSummaryComponent } from './components/summary/crowdgiving-summary.component';
import { TranslocoModule } from '@ngneat/transloco';
import { DsLibraryModule } from '@crowdfarming/ds-library';
import * as SECTIONS from './sections';
import * as SERVICES from './services';

const routes: Routes = [{ path: '', component: CrowdgivingPageComponent }];

const _SECTIONS = [
  SECTIONS.CrowdgivingNgosComponent,
  SECTIONS.CrowdgivingProductsComponent,
  SECTIONS.CrowdgivingPaymentComponent,
];

const _SERVICES = [
  SERVICES.CrowdgivingCartService,
  SERVICES.CrowdgivingNgoService,
  SERVICES.CrowdgivingOrderService,
  SERVICES.CrowdgivingProductService,
];

@NgModule({
  declarations: [CrowdgivingPageComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TranslocoModule,
    DsLibraryModule,
    CrowdgivingSummaryComponent,
    ..._SECTIONS
  ],
  providers: [
    CrowdgivingPageService,
    CrowdgivingStoreService,
    ..._SERVICES
  ]
})
export class CrowdgivingPageModule { }
