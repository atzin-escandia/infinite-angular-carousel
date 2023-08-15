import {Component, Input} from '@angular/core';

@Component({
  selector: 'landing-video-player',
  templateUrl: './landing-video-player.component.html',
  styleUrls: ['./landing-video-player.component.scss']
})
export class LandingVideoPlayerComponent {
  @Input() title?: string = '';
  @Input() sizingVideo = false;
  @Input() subTitle?: string = '';
  @Input() option?: number;
  @Input() body?: string = '';
  @Input() noLazyStart = false;
  @Input() videoId: string;
  @Input() platform = 'youtube';

  public smallVideoOption = 2;
}
