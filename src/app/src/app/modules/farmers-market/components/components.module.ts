import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@modules/shared/shared.module';
import { GridComponent } from './grid/grid.component';
import { CatalogueComponent } from './catalogue/catalogue.component';
import { AdoptionsCatalogueComponent } from './adoptions-catalogue/adoptions-catalogue.component';
import { BoxesCatalogueComponent } from './boxes-catalogue/boxes-catalogue.component';
import { FiltersMenuPopoverComponent } from '@modules/farmers-market/popovers';
import { FiltersMenuBtnComponent } from './filters-menu-btn/filters-menu-btn.component';
import { DropdownSelectComponent } from './dropdown-select/dropdown-select.component';
import { HeaderProjectsListComponent } from './header-projects-list/header-projects-list.component';
import { InfographyComponent } from './infography/infography.component';
import { InfographyItemComponent } from './infography-item/infography-item.component';
import { PipesModule } from '@modules/farmers-market/pipes/pipes.module';
import { ProjectCardModule } from '@app/components/home/project-card/project-card.module';
import { AgroupmentsComponent } from './agroupments/agroupments.component';
import { SortingSelectorComponent } from './sorting-selector/sorting-selector.component';
import { NoResultsPageComponent } from './no-results-page/no-results-page.component';
import { CrossSellingBlockModule } from '@app/components';
import { AgroupmentModule } from '@components/agroupment/agroupment.module';
import { TableGridModule } from '@components/table-grid/table-grid.module';
import { CtaBtnModule } from '@components/cta-btn/cta-btn.module';
import { BannerCustomBoxComponent } from './banner-custom-box/banner-custom-box.component';
import { CustomButtonModule } from './custom-button/custom-button.module';

@NgModule({
  declarations: [
    AdoptionsCatalogueComponent,
    BoxesCatalogueComponent,
    CatalogueComponent,
    DropdownSelectComponent,
    HeaderProjectsListComponent,
    FiltersMenuBtnComponent,
    NoResultsPageComponent,
    FiltersMenuPopoverComponent,
    SortingSelectorComponent,
    GridComponent,
    InfographyComponent,
    InfographyItemComponent,
    AgroupmentsComponent,
    BannerCustomBoxComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    PipesModule,
    CrossSellingBlockModule,
    ProjectCardModule,
    CustomButtonModule,
    AgroupmentModule,
    TableGridModule,
    CtaBtnModule,
  ],
  exports: [
    AdoptionsCatalogueComponent,
    BoxesCatalogueComponent,
    CatalogueComponent,
    DropdownSelectComponent,
    HeaderProjectsListComponent,
    FiltersMenuBtnComponent,
    NoResultsPageComponent,
    FiltersMenuPopoverComponent,
    SortingSelectorComponent,
    GridComponent,
    InfographyComponent,
    InfographyItemComponent,
    AgroupmentsComponent,
    CrossSellingBlockModule,
    BannerCustomBoxComponent,
  ],
})
export class ComponentsModule {}
