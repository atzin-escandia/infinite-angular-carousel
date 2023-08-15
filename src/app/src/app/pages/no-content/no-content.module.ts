import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {DsLibraryModule} from '@crowdfarming/ds-library';
import {NoContentPageComponent} from './no-content.page';
import {NoContentRoutingModule} from './no-content-routing.module';
import {LottieModule} from 'ngx-lottie';
// import {LottieOptions} from 'ngx-lottie/lib/symbols';
import player from 'lottie-web';
import {SharedModule} from '../../modules/shared/shared.module';

export const playerFactory = (): any => player;
const lottieOpts = { player: playerFactory, useCache: true };

@NgModule({
  declarations: [
    NoContentPageComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    DsLibraryModule,
    LottieModule.forRoot(lottieOpts),
    NoContentRoutingModule,
  ],
})
export class NoContentModule { }
