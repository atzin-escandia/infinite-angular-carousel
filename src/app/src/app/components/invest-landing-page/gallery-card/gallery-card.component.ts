import { Component, Injector, Input, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from '@components/base';
import { RouterService } from '@app/services';

@Component({
  selector: 'gallery-card',
  templateUrl: './gallery-card.component.html',
  styleUrls: ['./gallery-card.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class GalleryCardComponent extends BaseComponent {
  @Input() info: any;
  public showText = false;

  constructor(public injector: Injector, public routerSrv: RouterService) {
    super(injector);
  }

  public openText(): void {
    this.showText = !this.showText;
  }
}
