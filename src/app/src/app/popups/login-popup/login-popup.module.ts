import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {LoginPopupComponent} from './login-popup.component';
import {SharedModule} from '@app/modules/shared/shared.module';
import {FormsModule} from '@angular/forms';
import {SocialButtonsModule} from '@app/components/social-buttons/social-buttons.module';

@NgModule({
  declarations: [LoginPopupComponent],
  imports: [CommonModule, FormsModule, SharedModule, SocialButtonsModule],
  exports: [LoginPopupComponent],
})
export class LoginPopupModule { }
