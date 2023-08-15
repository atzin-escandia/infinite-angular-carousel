import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatusBoxModule } from '@app/components/status-box/status-box.module';
import {PurchaseServicesModule} from '@app/modules/purchase/services/purchase.module';
import { ConfirmationPopupModule } from '@popups/confirmation-popup/confirmation-popup.module';
import { StatusPopupModule } from '@popups/status-popup/status-popup.module';
import { SharedModule } from '../../../shared/shared.module';
import { UserAccountComponentsModule } from '../../components/components.module';
import { MyPaymentsMethodsRoutingModule } from './my-payments-methods-routing.module';
import { MyPaymentsMethodsPageComponent } from './my-payments-methods.page';
@NgModule({
  declarations: [
    MyPaymentsMethodsPageComponent
  ],
  imports: [
    CommonModule,
    MyPaymentsMethodsRoutingModule,
    SharedModule,
    FormsModule,
    UserAccountComponentsModule,
    StatusBoxModule,
    ConfirmationPopupModule,
    StatusPopupModule,
    PurchaseServicesModule
  ]
})
export class MyPaymentsMethodsModule { }
