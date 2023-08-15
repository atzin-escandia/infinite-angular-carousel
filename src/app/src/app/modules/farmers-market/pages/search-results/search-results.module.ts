import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@modules/shared/shared.module';
import { SearchResultsPageComponent } from './search-results.page';
import { SearchResultsRoutingModule } from './search-results-routing.module';
import { ComponentsModule } from '@app/modules/farmers-market/components/components.module';

@NgModule({
  declarations: [SearchResultsPageComponent],
  imports: [CommonModule, SharedModule, SearchResultsRoutingModule, ComponentsModule],
})
export class SearchResultsModule {}
