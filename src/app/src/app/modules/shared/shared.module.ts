import { NgModule } from '@angular/core';
import { CFDesignModule } from '@crowdfarming/cf-design';
import { DsLibraryModule } from '@crowdfarming/ds-library';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { TranslationPipe } from '@pipes/translation';
import { SafeHtmlPipe } from '@pipes/safe-html/safe-html.pipe';
import { TruncatePipe } from '@pipes/truncate';
import { CDNPipe } from '@pipes/cdn';
import { CFCurrencyPipe } from '@pipes/currency';
import { FilterPipe } from '@pipes/filter';
import { DeliveryCountryPipe } from '@pipes/delivery-country';
import { NoFinalPeriodPipe } from '@pipes/no-final-period';
import { AutoFocusDirective, StopPropagationDirective } from '@app/directives';
import { ClickElsewhereDirective } from '@app/directives';
import { MaskInputDirective } from '@app/directives';
import { DatacyDirective } from '@app/directives/datacy/datacy.directive';
import { ImageLazyComponent } from '@app/components/image-lazy/image-lazy.component';
import { CommonModule } from '@angular/common';
import { AutocompletePipe } from '@pipes/autocomplete';
import { TogglePasswordComponent } from '@app/components/toggle-password';
import { TranslocoRootModule } from '@app/transloco/transloco-root.module';
import { CopyClipboardDirective } from '@app/directives';
import { OrderDummyImageComponent } from '@app/components/order-dummy-image/order-dummy-image.component';
import { TranslateSealsPipe } from '@app/pipes/translate-seals';
import { MultiLangTranslationPipe } from '@app/pipes/multilang-translation';

@NgModule({
  declarations: [
    TranslationPipe,
    TranslateSealsPipe,
    MultiLangTranslationPipe,
    TruncatePipe,
    CDNPipe,
    CFCurrencyPipe,
    FilterPipe,
    DeliveryCountryPipe,
    AutocompletePipe,
    NoFinalPeriodPipe,
    SafeHtmlPipe,
    AutoFocusDirective,
    StopPropagationDirective,
    ClickElsewhereDirective,
    MaskInputDirective,
    DatacyDirective,
    ImageLazyComponent,
    TogglePasswordComponent,
    CopyClipboardDirective,
    SafeHtmlPipe,
    OrderDummyImageComponent,
  ],
  imports: [CommonModule, InfiniteScrollModule, TranslocoRootModule],
  providers: [
    CDNPipe,
    TruncatePipe,
    TranslationPipe,
    TranslateSealsPipe,
    MultiLangTranslationPipe,
    CFCurrencyPipe,
    FilterPipe,
    DeliveryCountryPipe,
    AutocompletePipe,
    NoFinalPeriodPipe,
    SafeHtmlPipe,
  ],
  exports: [
    CFDesignModule,
    DsLibraryModule,
    TranslationPipe,
    TranslateSealsPipe,
    MultiLangTranslationPipe,
    TruncatePipe,
    CDNPipe,
    CFCurrencyPipe,
    FilterPipe,
    DeliveryCountryPipe,
    AutocompletePipe,
    NoFinalPeriodPipe,
    SafeHtmlPipe,
    StopPropagationDirective,
    ClickElsewhereDirective,
    MaskInputDirective,
    DatacyDirective,
    ImageLazyComponent,
    TogglePasswordComponent,
    TranslocoRootModule,
    CopyClipboardDirective,
    OrderDummyImageComponent,
    AutoFocusDirective,
  ],
})
export class SharedModule {}
