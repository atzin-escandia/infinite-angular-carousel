import { Component, Input } from '@angular/core';
import { AUTO_STYLE, animate, state, style, transition, trigger, AnimationEvent } from '@angular/animations';
import { UnknownObjectType } from '../../../../interfaces';
import { ProductService, TextService, UtilsService } from '../../../../services';

@Component({
  selector: 'app-product-go-invitation',
  templateUrl: './product-go-invitation.component.html',
  styleUrls: ['./product-go-invitation.component.scss'],
  animations: [
    trigger('collapse', [
      state('false', style({ height: AUTO_STYLE, visibility: AUTO_STYLE })),
      state('true', style({ height: '0', visibility: 'hidden' })),
      transition('false => true', animate(250 + 'ms ease-in')),
      transition('true => false', animate(250 + 'ms ease-out')),
    ]),
  ],
})
export class ProductGoInvitationComponent {
  @Input() product: UnknownObjectType;

  showDetail = false;
  detailAnimationDone = false;

  constructor(public textSrv: TextService, public productSrv: ProductService, public utilsSrv: UtilsService) {}

  getProductImgSrc(): string {
    return this.product.masterBox?.pictureURL || this.product.farm.pictureURL;
  }

  getProductImgAlt(): string {
    return this.product.name || this.product.upCf?.name;
  }

  getProductTitle(): string {
    return `${String(this.product.numMasterBoxes)} x ${this.textSrv.getText(this.productSrv.productTypeText(this.product))}`;
  }

  toggleDetail(): void {
    this.showDetail = !this.showDetail;
  }

  onAnimationEvent(e: AnimationEvent): void {
    this.detailAnimationDone = false;
    this.detailAnimationDone = e.phaseName === 'done';
  }
}
