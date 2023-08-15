import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { AddressModule } from '../../../components/address/address.module';
import { CountriesPrefixModule } from '../../../components/countries-prefix/countries-prefix.module';
import { CountrySelectorModule } from '../../../components/country-selector/country-selector.module';
import { ImageGalleryModule } from '../../../components/image-gallery/image-galley.module';
import { NotificationLanguageModule } from '../../../components/notification-language/notification-language.module';
import { AdoptionCardComponent } from './adoption-card/adoption-card.component';
import { InfoNewsletterComponent } from './info-newsletter/info-newsletter.component';
import { InfoPersonalComponent } from './info-personal/info-personal.component';
import { OrderCardComponent } from './order-card/order-card.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { OrderStatusChipComponent } from './order-status-chip/order-status-chip.component';
import { SeasonCalculatorComponent } from './season-calculator/season-calculator.component';
import { UpDetailComponent } from './up-detail/up-detail.component';
import { UpHarvestComponent } from './up-harvest/up-harvest.component';
import { ImagesGroupComponent } from './images-group/images-group.component';
import { OrderGroupDetailComponent } from './order-group-detail/order-group-detail.component';
import { OrderGroupCardComponent } from './order-group-card/order-group-card.component';
import { SubscriptionDetailComponent } from './subscription-detail/subscription-detail.component';
import { SubscriptionBoxComponent } from './subscription-box/subscription-box.component';
import { SubscriptionCardComponent } from './subscription-card/subscription-card.component';
import { CancelSubscriptionPopupComponent } from '../popups/cancel-subscription-popup/cancel-subscription-popup';
import { GiftChipComponent } from './gift-chip/gift-chip.component';
import { AccordionGiftComponent } from './accordion-gift/accordion-gift.component';
import { StatusBoxModule } from '@app/components/status-box/status-box.module';
import { OrderPaymentIconComponent } from './order-payment-icon/order-payment-icon.component';
import { CrowdgivingPageModule } from '@modules/crowdgiving/crowdgiving.module';
import { CustomOrderInfoComponent } from './custom-order-info/custom-order-info.component';
import { CustomBoxSummaryComponent } from './custom-box-summary/custom-box-summary.component';
import { ImagesMosaicModule } from '@app/components';
import { TrackingInfoComponent } from './tracking-info/tracking-info.component';
import { ProductsListComponent } from './products-list/products-list.component';
import { ProductItemComponent } from './products-list/product-item/product-item.component';
import { OrderUserInfoComponent } from './order-user-info/order-user-info.component';
import { OrderPaymentInfoComponent } from './order-payment-info/order-payment-info.component';
import { TranslocoModule } from '@ngneat/transloco';
import { PaymentIconComponent } from './order-payment-info/payment-icon/payment-icon.component';
import { PaymentStatusComponent } from './order-payment-info/payment-status/payment-status.component';
import { CheckDeliveredOrderComponent } from './tracking-info/check-delivered-order/check-delivered-order.component';
import { StripeModule } from '@app/components/stripe/stripe.module';
import { OptionCardModule } from '@app/components/option-card/option-card.module';
import { BreadcrumbsComponent } from '@app/components/breadcumbs/breadcrumbs.component';
import { CustomOrderCardContentComponent } from './custom-order-card-content/custom-order-card-content.component';
import { ProjectsWrapperComponent } from './projects-wrapper/projects-wrapper.component';
import { PipesModule } from '../../farmers-market/pipes/pipes.module';

@NgModule({
  declarations: [
    AdoptionCardComponent,
    BreadcrumbsComponent,
    InfoNewsletterComponent,
    CancelSubscriptionPopupComponent,
    InfoPersonalComponent,
    OrderCardComponent,
    SubscriptionCardComponent,
    ImagesGroupComponent,
    OrderGroupDetailComponent,
    SubscriptionDetailComponent,
    OrderGroupCardComponent,
    OrderStatusChipComponent,
    OrderDetailComponent,
    SeasonCalculatorComponent,
    UpDetailComponent,
    UpHarvestComponent,
    AccordionGiftComponent,
    GiftChipComponent,
    SubscriptionBoxComponent,
    OrderPaymentIconComponent,
    CustomOrderInfoComponent,
    CustomBoxSummaryComponent,
    TrackingInfoComponent,
    ProductsListComponent,
    ProductItemComponent,
    OrderUserInfoComponent,
    OrderPaymentInfoComponent,
    PaymentIconComponent,
    PaymentStatusComponent,
    CheckDeliveredOrderComponent,
    CustomOrderCardContentComponent,
    ProjectsWrapperComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ImageGalleryModule,
    CountrySelectorModule,
    CountriesPrefixModule,
    NotificationLanguageModule,
    AddressModule,
    CrowdgivingPageModule,
    OptionCardModule,
    StripeModule,
    StatusBoxModule,
    ImagesMosaicModule,
    TranslocoModule,
    PipesModule,
  ],
  exports: [
    AdoptionCardComponent,
    BreadcrumbsComponent,
    InfoNewsletterComponent,
    InfoPersonalComponent,
    OrderCardComponent,
    SubscriptionCardComponent,
    ImagesGroupComponent,
    OrderGroupDetailComponent,
    CancelSubscriptionPopupComponent,
    SubscriptionDetailComponent,
    OrderGroupCardComponent,
    OrderDetailComponent,
    SeasonCalculatorComponent,
    UpDetailComponent,
    UpHarvestComponent,
    NotificationLanguageModule,
    AddressModule,
    OptionCardModule,
    StripeModule,
    SubscriptionBoxComponent,
    ImageGalleryModule,
    CountrySelectorModule,
    CountriesPrefixModule,
    AccordionGiftComponent,
    GiftChipComponent,
    CustomOrderInfoComponent,
    CustomBoxSummaryComponent,
    TrackingInfoComponent,
    ProductsListComponent,
    ProductItemComponent,
    OrderUserInfoComponent,
    OrderPaymentInfoComponent,
    PaymentIconComponent,
    PaymentStatusComponent,
    CheckDeliveredOrderComponent,
    CustomOrderCardContentComponent,
    ProjectsWrapperComponent,
  ],
})
export class UserAccountComponentsModule {}
