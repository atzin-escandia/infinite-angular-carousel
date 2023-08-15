import { Component, EventEmitter, Injector, Input, Output } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { RouterService } from '../../services';
import { BaseComponent } from '../base';

@Component({
  selector: 'cta-btn-component',
  templateUrl: 'cta-btn.component.html',
})
export class CtaBtnComponent extends BaseComponent {
  @Input() info;
  @Output() outputScrollEmitter: EventEmitter<string> = new EventEmitter<string>();

  constructor(public injector: Injector, public routerSrv: RouterService, public translocoSrv: TranslocoService) {
    super(injector);
  }

  navigateTo(): void {
    this.info.URLKey ? this.redirectLanding() : this.outputScrollEmitter.emit();
  }

  redirectLanding(): void {
    const URLLink = this.translocoSrv.translate(this.info.URLKey);
    const isInternallLink = URLLink.includes(this.env.domain);
    const path = this.routerSrv.getRouteFromURL(URLLink, this.env.domain);

    if (this.info?.newTab) {
      window.open(URLLink, '_blank');
    } else {
      isInternallLink ? this.routerSrv.navigate(path) : window.open(URLLink, '_self');
    }
  }
}
