import {Component, Injector, Input, OnChanges} from '@angular/core';

import {BaseComponent} from '../base';

@Component({
  selector: 'blog-block',
  templateUrl: './blog-block.component.html',
  styleUrls: ['./blog-block.component.scss']
})
export class BlogBlockComponent extends BaseComponent implements OnChanges {
  @Input() blogPosts: any[];
  public loaded = false;

  constructor(public injector: Injector) {
    super(injector);
  }

  ngOnChanges(): void {
    if (this.blogPosts && !this.loaded) {
      this.loaded = true;
    }
  }
}
