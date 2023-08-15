import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SocialButtonsComponent} from './social-buttons.component';
import {TranslocoRootModule} from '@app/transloco/transloco-root.module';

@NgModule({
  declarations: [SocialButtonsComponent],
  imports: [CommonModule, TranslocoRootModule],
  exports: [SocialButtonsComponent],
})
export class SocialButtonsModule { }
