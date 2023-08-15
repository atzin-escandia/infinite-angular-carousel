import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserAccountRoutingModule } from './user-account-routing.module';

import { PrivateDesktopMenuComponent } from './components/private-desktop-menu';
import { UserAccountComponentsModule } from './components/components.module';
import { UserAccountPageComponent } from './user-account.page';
import { SharedModule } from '../shared/shared.module';
import { StatusBoxModule } from '@app/components/status-box/status-box.module';
import { PipesModule } from '../farmers-market/pipes/pipes.module';

@NgModule({
  declarations: [PrivateDesktopMenuComponent, UserAccountPageComponent],
  imports: [
    CommonModule,
    UserAccountRoutingModule,
    UserAccountComponentsModule,
    StatusBoxModule,
    SharedModule,
    PipesModule
  ]
})
export class UserAccountCoreModule { }
