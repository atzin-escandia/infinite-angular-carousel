import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AUTO_STYLE, animate, state, style, transition, trigger, AnimationEvent } from '@angular/animations';
import { CartsService, DomService, LangService } from '@app/services';
import { UnknownObjectType } from '@app/interfaces';

@Component({
  selector: 'checkout-summary',
  templateUrl: './checkout-summary.component.html',
  styleUrls: ['./checkout-summary.component.scss'],
  animations: [
    trigger('collapse', [
      state('false', style({ height: AUTO_STYLE, visibility: AUTO_STYLE })),
      state('true', style({ height: '0', visibility: 'hidden' })),
      transition('false => true', animate(300 + 'ms ease-in')),
      transition('true => false', animate(300 + 'ms ease-out')),
    ]),
  ],
})
export class CheckoutSummaryComponent {
  @Input() summaryOpen: boolean;
  @Input() products: any[];
  @Input() price = 0;
  @Input() finalPrice = 0;
  @Input() canUpdateProduct: boolean;
  @Input() currentIso: string;
  @Input() hideHeader: boolean;
  @Input() isGroupOrder: boolean;
  @Input() isProductSubscriptionAvailable: boolean;
  @Input() credits = 0;
  @Input() creditsToSpend = 0;
  @Input() isProductGiftAvailable: boolean;
  @Input() isInCheckout: boolean;
  @Input() cart?: UnknownObjectType[];
  @Input() isDiscoveryBox?: false;

  @Output() titleClick = new EventEmitter();
  @Output() changeAddress = new EventEmitter();
  @Output() deleteProduct = new EventEmitter<number>();
  @Output() updateProduct = new EventEmitter<{
    cartItem: UnknownObjectType;
    product: UnknownObjectType;
    idx: number;
    isRefresh: boolean;
  }>();

  avoidContentOverflow = false;
  currentLangIso$ = this.langSrv.currentLangIso$;

  constructor(public domSrv: DomService, private cartsSrv: CartsService, private langSrv: LangService) {}

  public onTitleClick(): void {
    this.titleClick.emit();
  }

  public changeAddressHandler(): void {
    this.changeAddress.emit();
  }

  public deleteProductHandler(idx: number): void {
    this.deleteProduct.emit(idx);
  }

  public onAnimationEvent(e: AnimationEvent): void {
    this.avoidContentOverflow = this.summaryOpen && e.phaseName === 'done';
  }

  public updateProductHandler(
    { cartItem, product, isRefresh }: { cartItem: UnknownObjectType; product: UnknownObjectType; isRefresh: boolean },
    idx: number
  ): void {
    const emitData = { cartItem: cartItem || this.cartsSrv.getByIdx(idx), product, idx, isRefresh };

    this.updateProduct.emit(emitData);
  }
}
