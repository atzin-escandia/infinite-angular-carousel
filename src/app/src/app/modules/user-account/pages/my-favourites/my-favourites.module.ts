import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@modules/shared/shared.module';
import { UserAccountComponentsModule } from '../../components/components.module';
import { MyFavouritesPageComponent } from './my-favourites.page';
import { MyFavouritesRoutingModule } from './my-favourites-routing.module';
import { PipesModule } from '../../../farmers-market/pipes/pipes.module';

@NgModule({
    declarations: [MyFavouritesPageComponent],
    imports: [
        CommonModule,
        MyFavouritesRoutingModule,
        SharedModule,
        FormsModule,
        UserAccountComponentsModule,
        PipesModule
    ]
})
export class MyFavouritesModule {}
