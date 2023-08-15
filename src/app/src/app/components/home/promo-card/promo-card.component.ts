import { Component, Injector, Input } from '@angular/core';
import { BaseComponent } from '@components/base';
import { RouterService } from '@app/services';
import { TranslationPipe } from '@pipes/translation/translation.pipe';
@Component({
  selector: 'home-promo-card',
  templateUrl: './promo-card.component.html',
  styleUrls: ['./promo-card.component.scss'],
})
export class PromoCardComponent extends BaseComponent {
  @Input() promo: any;
  public link = '';
  constructor(public injector: Injector, public routerSrv: RouterService) {
    super(injector);
  }
  public translatePipe: TranslationPipe = new TranslationPipe(this.langSrv);
  navigate(): void {
    if (/^http/.test(this.promo.link)) {
      window.location.href = this.promo.link;
    } else {
      this.routerSrv.navigate(this.promo.link);
    }
  }
}
