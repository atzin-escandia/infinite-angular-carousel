import { BrowserModule, BrowserTransferStateModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideRemoteConfig, getRemoteConfig } from '@angular/fire/remote-config';
import localeDe from '@angular/common/locales/de';
import { registerLocaleData } from '@angular/common';
import { CFDesignModule } from '@crowdfarming/cf-design';
import { DsLibraryModule } from '@crowdfarming/ds-library';
import { PopoverModule } from './popover/popover.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { FooterComponent } from './components/footer';
import { NavBarComponent } from './components/navbar';
import { MobileMenuComponent } from './components/mobile-menu';
import { BannerStoreComponent } from './components/banner-store/banner-store.component';
import { LoaderComponent } from './components/loader';
import { SharedModule } from './modules/shared/shared.module';
import { BaseComponent } from './popups/base/base.component';
import { InsertionDirective } from './popups/insertion.directive';
import { NgxLogglyModule } from 'ngx-loggly-logger';
import { LoginPopupModule } from './popups/login-popup/login-popup.module';
import { ForgotPasswordPopupComponent } from './popups/forgot-password';
import { InfoPopupComponent } from './popups/info-popup';
import { StatusPopupModule } from './popups/status-popup/status-popup.module';
import { GenericPopupModule } from './popups/generic-popup/generic-popup.module';
import { SoftRegisterPopupModule } from './popups/soft-register/soft-register.module';
import { StoreButtonsModule } from './components/store-buttons/store-buttons.module';
import { BannedPayModule } from './popups/banned-pay/banned-pay.module';
import { SmartAppBannerModule } from './components/smart-app-banner/smart-app-banner.module';
import { TranslocoRootModule } from './transloco/transloco-root.module';
import { VisitFormPopupModule } from './popups/visit-from/visit-from.module';
import { PaymentConfirmationPopupModule } from './popups/payment-confirmation-popup/payment-confirmation-popup.module';
import { SubscriptionSelectorModule } from './components/subscription-selector/subscription-selector.module';
import { ProductSubscriptionModule } from './components/product-subscription/product-subscription.module';
import { APP_PROVIDERS } from './app.providers';
import { loadConfig } from './config/loadConfig';
import { ImpactMessageLoaderComponent } from './modules/purchase/components';
import { TableGridModule } from './components/table-grid/table-grid.module';
import { CtaBtnModule } from './components/cta-btn/cta-btn.module';

loadConfig();
registerLocaleData(localeDe);

@NgModule({
  declarations: [
    AppComponent,
    BaseComponent,
    FooterComponent,
    NavBarComponent,
    MobileMenuComponent,
    BannerStoreComponent,
    LoaderComponent,
    ImpactMessageLoaderComponent,
    InsertionDirective,
    ForgotPasswordPopupComponent,
    InfoPopupComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    CFDesignModule,
    DsLibraryModule,
    BrowserTransferStateModule,
    BrowserAnimationsModule,
    SubscriptionSelectorModule,
    ProductSubscriptionModule,
    FormsModule,
    StoreButtonsModule,
    TableGridModule,
    CtaBtnModule,
    HttpClientModule,
    NgxLogglyModule.forRoot(),
    CommonModule,
    PopoverModule,
    SharedModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideRemoteConfig(() => getRemoteConfig()),
    StatusPopupModule,
    SoftRegisterPopupModule,
    VisitFormPopupModule,
    GenericPopupModule,
    PaymentConfirmationPopupModule,
    BannedPayModule,
    SmartAppBannerModule,
    TranslocoRootModule,
    LoginPopupModule
  ],
  providers: APP_PROVIDERS,
  bootstrap: [AppComponent],
})
export class AppModule {}
