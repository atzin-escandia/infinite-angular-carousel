import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ECommerceRoutingModule } from './e-commerce-routing.module';
import { ECommerceComponent } from './e-commerce.page';
import { ComponentsModule } from './components/components.module';
import { ECommerceService } from './services/e-commerce.service';
import { UnavailableComponent } from './pages/unavailable/unavailable.page';
import { CatalogComponent } from './pages/catalog/catalog.page';
import { TranslocoModule } from '@ngneat/transloco';
import { DetailPageComponent } from './pages/detail/detail.page';
import { SharedModule } from '../shared/shared.module';
import { SealsManagerService, SealsService } from './services/seals-services';
import { EcImgEmptyComponent } from './components/ec-img-empty/ec-img-empty.component';

@NgModule({
  providers: [ECommerceService, SealsManagerService, SealsService],
  declarations: [ECommerceComponent, UnavailableComponent, CatalogComponent, DetailPageComponent],
  imports: [CommonModule, ECommerceRoutingModule, ComponentsModule, TranslocoModule, SharedModule, EcImgEmptyComponent],
})
export class ECommerceModule {}
