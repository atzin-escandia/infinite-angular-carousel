import {Component, OnInit, Input, ViewEncapsulation, Injector} from '@angular/core';
import {BaseComponent} from '../base';

declare const window: any;

@Component({
  selector: 'instagram-post',
  templateUrl: './instagram-post.component.html',
  styleUrls: ['./instagram-post.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InstagramPostComponent extends BaseComponent implements OnInit {
  @Input() idPost: string;

  constructor(public injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.loadInstagramScript();
  }

  /**
   * Load instagram script
   */
  private loadInstagramScript(): void {
    if (typeof window !== 'undefined') {
      if (!window.igLoaded) {
        ((w, d, s, _l, _i) => {
          const f = d.getElementsByTagName(s)[0];
          const j: any = d.createElement(s);

          j.async = true;
          j.src = '//www.instagram.com/embed.js';
          f.parentNode.insertBefore(j, f);
          w.igLoaded = true;
        })(window, document, 'script', 'dataLayer');
      }
    }
  }

  public showHTML(): string {
    return (
      '<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="https://www.instagram.com/p/' +
      this.idPost +
      '/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="13"><div><a href="https://www.instagram.com/p/' +
      this.idPost +
      '/?utm_source=ig_embed&amp;utm_campaign=loading" target="_blank"></a></div></blockquote>'
    );
  }
}
