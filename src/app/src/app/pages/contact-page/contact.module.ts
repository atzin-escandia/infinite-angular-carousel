import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactPageRoutingModule } from './contact-routing.module';
import { ContactPageComponent } from './contact.page';
import { SharedModule } from '@modules/shared/shared.module';
import { CrossSellingBlockModule } from '@components/cross-selling/cross-selling-block/cross-selling-block.module';
import { BlogBlockModule } from '@components/blog-block/blog-block.module';
import { CountrySelectorModule } from '@components/country-selector/country-selector.module';
import { CountriesPrefixModule } from '@components/countries-prefix/countries-prefix.module';

@NgModule({
  declarations: [ContactPageComponent],
  imports: [
    CommonModule,
    ContactPageRoutingModule,
    SharedModule,
    FormsModule,
    CrossSellingBlockModule,
    CountrySelectorModule,
    CountriesPrefixModule,
    BlogBlockModule,
  ],
  exports: [CrossSellingBlockModule],
})
export class ContactPageModule {}
