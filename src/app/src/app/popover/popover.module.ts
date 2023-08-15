import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PopoverBaseComponent} from './base/base.component';
import {CalendarShipmentComponent} from './calendar-shipment';
import {InvestPopoverComponent} from './invest-popover';
import {SubscribePopoverComponent} from './subscribe-popover';
import {FilterPopoverComponent} from './filter-popover';
import {AccordionPopoverComponent} from './accordion-popover';
import {FiltersContainerComponent} from './filter-popover/filters-container/filters-container';
import {FiltersDirectoryComponent} from './filter-popover/filters-directory-mobile/filters-directory-mobile';
import {ProductNotificationComponent} from './product-notification';
import {LocationLangComponent} from './location-lang';
import {UpCardMobileComponent} from './up-card-mobile';
import {PrivateMobileMenuComponent} from './private-mobile-menu';
import {FormsModule} from '@angular/forms';
import {SharedModule} from '../modules/shared/shared.module';
import {LocationLangMobileComponent} from './location-lang-mobile/location-lang-mobile.component';
import {CrossSellingPopoverComponent} from './cross-selling-popover/cross-selling-popover.component';
import {CrossSellingBlockModule} from '../components/cross-selling/cross-selling-block/cross-selling-block.module';

@NgModule({
    declarations: [
        PopoverBaseComponent,
        CalendarShipmentComponent,
        InvestPopoverComponent,
        PrivateMobileMenuComponent,
        ProductNotificationComponent,
        LocationLangComponent,
        SubscribePopoverComponent,
        FilterPopoverComponent,
        AccordionPopoverComponent,
        FiltersContainerComponent,
        UpCardMobileComponent,
        FiltersDirectoryComponent,
        LocationLangMobileComponent,
        CrossSellingPopoverComponent
    ],
    imports: [CommonModule, SharedModule, FormsModule, CrossSellingBlockModule]
})
export class PopoverModule { }
