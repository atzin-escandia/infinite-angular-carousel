import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ListRoutingModule } from './list-routing.module';
import { ListPageComponent } from './list.page';
import { SharedModule } from '@modules/shared/shared.module';
import { ColouredPopupModule } from '../../../popups/coloured-popup/coloured-popup.module';
import { GenericPopupModule } from '@popups/generic-popup/generic-popup.module';
import { UserAccountComponentsModule } from '../../../components/components.module';

@NgModule({
  declarations: [ListPageComponent],
  imports: [
    CommonModule,
    ListRoutingModule,
    SharedModule,
    UserAccountComponentsModule,
    // Popups
    ColouredPopupModule,
    GenericPopupModule,
  ],
})
export class ListModule {}
