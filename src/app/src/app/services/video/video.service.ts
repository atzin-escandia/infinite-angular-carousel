import { Injectable, Injector } from '@angular/core';

import { BaseService } from '../base';
import { DomService } from '../dom';

@Injectable({
  providedIn: 'root',
})
export class VideoService extends BaseService {
  private counter = 0;

  constructor(public injector: Injector, public domSrv: DomService) {
    super(injector);
  }

  /**
   * Insert video
   */
  public insert(id: string, platform: string, selector: string, autoplay?: boolean): Promise<void> {
    // Create imframe element
    return new Promise((resolve) => {
      if (!this.domSrv.isPlatformBrowser()) {
        return resolve();
      }
      const video = document.createElement('iframe');
      let url;

      // Build url based on platform
      if (platform === 'vimeo') {
        url = 'https://player.vimeo.com/video/' + id + '?color=00a89c&portrait=0';
      } else {
        url = autoplay
          ? 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&enablejsapi'
          : 'https://www.youtube-nocookie.com/embed/' + id;
      }

      // Add attributtes to iframe
      video.id = id;
      video.src = url;
      video.classList.add('embed-video');
      video.allow = 'autoplay; encrypted-media';
      video.allowFullscreen = true;
      // eslint-disable-next-line import/no-deprecated
      video.frameBorder = '0';

      // Set an interval to wait until element is present
      const checkExist = setInterval(() => {
        if (this.counter < 15 && document.querySelector(selector)) {
          document.querySelector(selector).appendChild(video);
          clearInterval(checkExist);
        }

        this.counter = this.counter + 1;

        return resolve();
      }, 200);
    });
  }
}
