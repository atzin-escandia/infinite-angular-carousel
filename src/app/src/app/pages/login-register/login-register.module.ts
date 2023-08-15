import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocialButtonsModule } from '@app/components/social-buttons/social-buttons.module';
import { LoginRegisterRoutingModule } from './login-register-routing.module';
import { LoginRegisterPageComponent } from './login-register.page';
import { SharedModule } from '@modules/shared/shared.module';
import { LoginComponent } from '@components/login';
import { LoginRegisterHeaderComponent } from '@components/login-register-header';
import { RegisterComponent } from '@components/register';
import { GenericPopupModule } from '@popups/generic-popup/generic-popup.module';

@NgModule({
  declarations: [
    LoginRegisterPageComponent,
    LoginComponent,
    LoginRegisterHeaderComponent,
    RegisterComponent
  ],
  imports: [
    CommonModule,
    LoginRegisterRoutingModule,
    SharedModule,
    FormsModule,
    GenericPopupModule,
    SocialButtonsModule,
    GenericPopupModule,
  ]
})
export class LoginRegisterModule {}
