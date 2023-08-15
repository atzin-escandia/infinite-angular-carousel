import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
// Shared
import {CFDesignModule} from '@crowdfarming/cf-design';
import {LottieModule} from 'ngx-lottie';
import {LottieOptions} from 'ngx-lottie/lib/symbols';
import player from 'lottie-web';
// Manifest
import {LandingManifestRoutingModule} from './landing-manifest-routing.module';
import {LandingManifestComponent} from './landing-manifest.page';

export const playerFactory = (): any => player;
const lottieOpts: LottieOptions = { player: playerFactory };

@NgModule({
  declarations: [LandingManifestComponent],
  imports: [
    CommonModule,
    CFDesignModule,
    LottieModule.forRoot(lottieOpts),
    LandingManifestRoutingModule
  ]
})
export class LandingManifestModule { }
