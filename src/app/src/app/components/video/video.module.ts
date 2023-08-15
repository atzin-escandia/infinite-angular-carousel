import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {VideoComponent} from './video.component';

@NgModule({
  declarations: [VideoComponent],
  imports: [CommonModule],
  exports: [VideoComponent],
})
export class VideoModule { }
