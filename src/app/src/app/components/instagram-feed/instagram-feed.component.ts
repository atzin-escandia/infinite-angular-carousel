import {Component, ViewEncapsulation, Injector} from '@angular/core';
import {BaseComponent} from '../base';

@Component({
  selector: 'instagram-feed',
  templateUrl: './instagram-feed.component.html',
  styleUrls: ['./instagram-feed.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InstagramFeedComponent extends BaseComponent {
  constructor(public injector: Injector) {
    super(injector);
  }
}
