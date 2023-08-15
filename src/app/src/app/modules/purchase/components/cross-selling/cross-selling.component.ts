import { KeyValue } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CartsService, LangService, TextService, TrackingConstants, TrackingService } from '../../../../services';

@Component({
  selector: 'cross-selling',
  templateUrl: './cross-selling.component.html',
  styleUrls: ['./cross-selling.component.scss'],
})
export class CrossSellingComponent implements OnInit {
  @Input() products: any = {};
  @Input() specifications: any;

  @Output() productAdded = new EventEmitter();

  public lang: string;

  constructor(
    public textSrv: TextService,
    private langSrv: LangService,
    private cartSrv: CartsService,
    private trackingSrv: TrackingService
  ) {}

  ngOnInit(): void {
    this.lang = this.langSrv.getCurrentLang();
  }

  public showBlock(item: any): boolean {
    return item.value.length && item.key && this.specifications?.[item.key];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public originalOrder = (_a: KeyValue<number, string>, _b: KeyValue<number, string>): number => 0;

  public addProductToCart(product: any): void {
    const isOneShot = product.sellingMethod === 'ONE_SHOT';
    const isMultiShot = !isOneShot;
    const isUberUp = product.typeUpSell === 'UBER_UPS';

    if (isMultiShot && product.upCf) {
      const stepLeft = product.upCf.stepMSReserved - product.upCf.stepMSUsed;

      this._addMultiShotProductToCart(product, stepLeft, isOneShot, isMultiShot, isUberUp);
    } else {
      this._addDefaultProductToCart(product, isOneShot, isMultiShot, isUberUp);
    }

    this.onAddProductTrackEvent(product);

    this.productAdded.emit();
  }

  private onAddProductTrackEvent(project: any): void {
    this.trackingSrv.trackEvent(
      TrackingConstants.GTM.EVENTS.ADD_TO_CART,
      true,
      {
        add: {
          products: [
            {
              name: project.code,
              id: project._id,
              category: project._m_up[this.langSrv.getCurrentLang()],
              price: project.price.amount,
              brand: project.brandName,
              quantity: 1,
              variant: TrackingConstants.GTM.PARAMS.OVERHARVEST,
            },
          ],
        },
      },
      TrackingConstants.GTM.ACTIONS.CROSSSELLING
    );
  }

  private _addMultiShotProductToCart(project: any, stepLeft: number, oneShot: boolean, multiShot: boolean, uberUp: boolean): void {
    this.cartSrv.add(
      project.upCf ? 'multiShotBox' : project.overharvest ? 'overharvest' : 'adoption',
      { _id: project._id, _m_up: project._m_up, _m_slug: project._m_upSlug },
      project.upCf ? project.upCf.name : project.overharvest ? null : project.name,
      project.upCf ? project.upCf : null,
      project._mbId,
      { numMasterBoxes: 1, mbLeft: stepLeft, stepMS: project.minStepMS },
      project.typeUpSell === 'UBER_UPS' ? project.uberUp : null,
      project.farmerSlug,
      { oneShot, multiShot, uberUp }
    );
  }

  private _addDefaultProductToCart(product: any, oneShot: boolean, multiShot: boolean, uberUp: boolean): void {
    this.cartSrv.add(
      product.overharvest ? 'overharvest' : 'adoption',
      { _id: product._id, _m_up: product._m_up, _m_slug: product._m_upSlug },
      product.overharvest ? null : product.name,
      null,
      product._mbId,
      { numMasterBoxes: product.cart.numMasterBoxes, mbLeft: undefined, stepMS: product.stepMS },
      product.typeUpSell === 'UBER_UPS' ? product.uberUp : null,
      product.farmerSlug,
      { oneShot, multiShot, uberUp }
    );
  }
}
