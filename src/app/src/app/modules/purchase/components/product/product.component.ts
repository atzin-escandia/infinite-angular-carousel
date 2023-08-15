import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AUTO_STYLE, animate, state, style, transition, trigger, AnimationEvent } from '@angular/animations';
import { CrosssellingNameComponent } from '../../../../popups/crossselling-name-popup';
import {
  CartsService,
  ProductService,
  TextService,
  UtilsService,
  LangService,
  StateService,
  LoggerService,
  RouterService,
} from '../../../../services';
import { PopoverService } from '../../../../services/popover';
import { PopupService } from '../../../../services/popup';
import { CheckoutProductsService, CheckoutStoreService } from '../../services';
import { Seal, UnknownObjectType } from '../../../../interfaces';
import { Observable } from 'rxjs';
import { ISubscriptionConfiguration } from '@app/interfaces/subscription.interface';
import { IProductUpdateParams } from '../../interfaces/product.interface';
import { SealsManagerService } from '@app/modules/e-commerce/services/seals-services';
import { IECProduct, IECProductItem } from '@app/interfaces/product.interface';
import { PRODUCT_TYPE } from '@app/constants/product.constants';
import { ImagesDTO } from '@app/components/images-mosaic/interfaces/images-dto';

@Component({
  selector: 'purchase-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  animations: [
    trigger('collapse', [
      state('false', style({ height: AUTO_STYLE, visibility: AUTO_STYLE })),
      state('true', style({ height: '0', visibility: 'hidden' })),
      transition('false => true', animate(250 + 'ms ease-in')),
      transition('true => false', animate(250 + 'ms ease-out')),
    ]),
  ],
})
export class PurchaseProductComponent implements OnInit {
  @Input() isCartSection: boolean;

  @Input() set product(product: UnknownObjectType) {
    this._product = product || {};
    this.ecImagesProduct = this.ecommerceProductsImgs();
    this.checkEcommerce();
  }

  get product(): UnknownObjectType {
    return this._product;
  }

  @Input() seals: Seal[] = [];
  @Input() isGiftFormCompleted: boolean;
  @Input() itemCart: any;
  @Input() index: number;
  @Input() canUpdate: boolean;
  @Input() currentIso: string;
  @Input() isSubscriptionAvailable: boolean;
  @Input() isGiftAvailable: boolean;
  @Input() isInCheckout: boolean;
  @Input() cart?: UnknownObjectType[];

  @Output() delete = new EventEmitter();
  @Output() update = new EventEmitter<IProductUpdateParams>();

  get imgSrc(): string {
    if (this.product?.multiShot) {
      return this.product.pictureURL || this.product.farm?.pictureURL;
    } else {
      return this.product.masterBox?.pictureURL || this.product.farm?.pictureURL;
    }
  }

  get imgAlt(): string {
    return this.product.name ? this.product.name : this.product.upCf ? this.product.upCf.name : this.textSrv.getText('name it');
  }

  get showDeliverySelector(): boolean {
    return !this.product.multiShot && !this.product.multiShotRenew;
  }

  get showQuantitySelector(): boolean {
    return this.product.multiShotBox || this.product.overharvest || this.product.multiShot || this.product.multiShotRenew;
  }

  get showBoxesSelector(): boolean {
    if (this.product.masterBoxes?.length) {
      return (this.checkoutProductSrv.filterProductMbs(this.product)?.length || 0) > 1;
    }

    return false;
  }

  get maxQuantitySelector(): number {
    if (this.product.overharvest) {
      return this.product?.season?.availableOverHarvest || this.product?.mbLeft;
    } else {
      return this.product?.up?.maxStepMS;
    }
  }

  get isInvalid(): boolean {
    return !!this.product.cantSend || !!this.product.datesNoAvailable;
  }

  get isSubscriptionAvailableWhenIsNotCartSection(): boolean {
    return this.isSubscriptionAvailable && this.sectionQuery !== 'cart' && !this.isInvalid && this.product?.subscription?.active;
  }

  get isSubscriptionAvailableOnCartSection(): boolean {
    return this.isSubscriptionAvailable && this.sectionQuery === 'cart' && !this.isInvalid && this.product?.subscription?.active;
  }

  get canShowAdoptionGift(): boolean {
    return (
      this.isGiftAvailable &&
      ((this.product.gift?.available && this.sectionQuery === 'cart') ||
        (this.product.gift?.giftOptions?.name && this.sectionQuery !== 'cart') ||
        (this.currentCartItem?.gift?.isActiveGift && this.sectionQuery !== 'cart'))
    );
  }

  get isEcommerceInvalidDeliveryCountry(): boolean {
    return this.product?.invalidDeliveryCountry;
  }

  get deliveryDate(): string {
    return this.isEcommerce ? this.product?.deliveryDate : this.product?.selectedDate;
  }

  private _product: UnknownObjectType = {};

  ecImagesProduct: ImagesDTO[];
  isEcommerce = false;
  isUnavailableArticles = false;

  calendarSelectorOpen = false;
  giftSelectorOpen = false;
  showDetail = false;
  sectionQuery: string;
  subscriptionActive: boolean;
  currentCartItem: UnknownObjectType;
  detailAnimationDone = false;
  isGiftEnabled = false;
  isSubscriptionAvailable$: Observable<boolean>;
  ecProductSeals: string[] = [];
  ecProductItemsWarnError: { lokaliseKey: string; amount?: number; numItems?: number };

  constructor(
    public textSrv: TextService,
    public productSrv: ProductService,
    public checkoutProductSrv: CheckoutProductsService,
    public utilsSrv: UtilsService,
    public langSrv: LangService,
    public cartSrv: CartsService,
    public stateSrv: StateService,
    public routerSrv: RouterService,
    private popoverSrv: PopoverService,
    private sealsManagerSrv: SealsManagerService,
    private popupSrv: PopupService,
    private storeSrv: CheckoutStoreService,
    private loggerSrv: LoggerService,
  ) {}

  ngOnInit(): void {
    this.isSubscriptionAvailable$ = this.stateSrv.isSubscriptionAvailable();
    this.sectionQuery = this.storeSrv.sectionQuery;
    this.currentCartItem = this.cart ? this.cart[this.index] : this.cartSrv.getByIdx(this.index);

    if (this.isEcommerce) {
      this.sealsMap();
      this.checkUnavailablesProducts();
      this.getEcProductItemsWarnError();
    }
  }

  ecommerceProductsImgs(): ImagesDTO[] {
    return this.product?.ecommerceProducts?.map((elem) => ({
      src: elem.pictureURL,
      available: elem.available,
    }));
  }

  checkEcommerce(): void {
    this.isEcommerce = this.product?.type === PRODUCT_TYPE.ECOMMERCE;
  }

  checkUnavailablesProducts(): void {
    this.isUnavailableArticles =
      this.isEcommerce && this.product.ecommerceProducts?.some((product) => !product.available);
    this.showDetail = this.isUnavailableArticles;
  }

  shipmentPopup(product: any): void {
    const selector = `product-delivery-selector-ref-${this.index}`;

    this.calendarSelectorOpen = true;

    this.popoverSrv.open('CalendarShipmentComponent', selector, {
      inputs: { product },
      outputs: {
        save: (date: any) => {
          const updatedItem = this.cartSrv.getByIdx(this.index);

          updatedItem.selectedDate = date;
          product.selectedDate = date;
          this.emitUpdate({ cartItem: updatedItem, product, isRefresh: false });
        },
        onClose: () => {
          this.popoverSrv.close('CalendarShipmentComponent');
          this.calendarSelectorOpen = false;
        },
      },
    });
  }

  deleteProduct(): void {
    this.delete.emit();
  }

  editProductName(): void {
    const products = [
      {
        name: this.product.name || null,
        picture: this.product.pictureURL,
        publicVariety: this.product.up.publicVariety,
        index: this.index,
      },
    ];

    this.popupSrv
      .open(CrosssellingNameComponent, {
        data: { products },
      })
      .onClose.subscribe((result) => {
        if (result) {
          const cart = this.cartSrv.get();
          const product = this.product;
          const name = result[0].name;

          cart[this.index].name = name;
          product.name = name;

          this.emitUpdate({ cartItem: cart[this.index], product, isRefresh: false });
        }
      });
  }

  addSubtractUms(evType: number): void {
    const product = this.product;
    const updatedCartItem = this.productSrv.changeQuantity(this.cartSrv.get(), evType, product, this.index);

    if (product.multiShotBox || product.multiShot) {
      this.checkoutProductSrv.modifyBoxesPerAdoption({ masterBox: product._masterBox, quantity: evType, upCf: product._upCf });
    }

    if (updatedCartItem) {
      this.emitUpdate({ cartItem: updatedCartItem });
    }
  }

  public toggleDetail(): void {
    this.showDetail = !this.showDetail;
  }

  onAnimationEvent(e: AnimationEvent): void {
    this.detailAnimationDone = false;
    this.detailAnimationDone = e.phaseName === 'done';
  }

  getSelectedMasterBoxValue(): string {
    const filteredMbsIdx = this.product.mbSelected || 0;
    const selectedMb = this.product.filteredMbs[filteredMbsIdx] as UnknownObjectType & { weight: string; _m_weightUnit: any[] };
    const { weight, _m_weightUnit }: { weight: string; _m_weightUnit: any[] } = selectedMb;
    const weightUnit: string = _m_weightUnit[this.langSrv.getCurrentLang()];
    const textMbNotAvailable = this.isMbAvailable(selectedMb) ? '' : `(${this.textSrv.getText('Not available')})`;

    return `${weight} ${weightUnit} ${textMbNotAvailable}`;
  }

  getOptionMasterBoxValue(mb: any): string {
    const weight: string = mb.weight;
    const weightUnit: string = mb._m_weightUnit[this.langSrv.getCurrentLang()];
    const textMbNotAvailable = this.isMbAvailable(mb) ? '' : `(${this.textSrv.getText('Not available')})`;

    return `${weight} ${weightUnit} ${textMbNotAvailable}`;
  }

  isMbAvailable(mb: any): boolean {
    return !!mb?.firstDate;
  }

  setMasterBox(mb: any, index: number): void {
    if (this.isMbAvailable(mb)) {
      this.changeMb(index);
    }
  }

  changeMb(mbIdx: number): void {
    const updatedCartItem = this.cartSrv.getByIdx(this.index);

    updatedCartItem._masterBox = this.product.filteredMbs[mbIdx]._id.toString();
    updatedCartItem.masterBox = this.product.filteredMbs[mbIdx];
    updatedCartItem.selectedDate = null;
    this.emitUpdate({ cartItem: updatedCartItem });
  }

  subscriptionOnChangeHanlder({ cartItem, config }: { cartItem: UnknownObjectType; config: ISubscriptionConfiguration }): void {
    this.currentCartItem = { ...this.currentCartItem, ...cartItem };
    this.emitUpdate({ cartItem, subsConfig: config, isRefresh: false });
  }

  quantityChangeHandler(quantity: number): void {
    if (quantity >= this.maxQuantitySelector) {
      this.loggerSrv.log('Product max quantity selection reached', {
        logType: 'product',
        up: this.product?._up,
        selectedQuantity: quantity,
        maxQuantity: this.maxQuantitySelector,
      });
    }
  }

  getAvailabilityError(ecItemId: string): string {
    const product = this.product as IECProduct;
    const availabilityErrors = product.errors.availability;
    const error = availabilityErrors.find((elem) => elem.articles?.includes(ecItemId))?.type;

    switch (error) {
      case 'noStock':
        return 'page.Not-available.text-info';
      case 'availableDates':
        return 'page.not-available-same-shipping.text-info';
      default:
        return 'page.Not-available.text-info';
    }
  }

  navToEcCatalog(): void {
    this.routerSrv.navigateToEcommerce();
  }

  private sealsMap(): void {
    if (!this.isEcommerceInvalidDeliveryCountry) {
      this.ecProductSeals = this.product.ecommerceProducts.map((elem: IECProductItem) => {
        const sealsList = this.sealsManagerSrv.getProjectSeals(this.seals, elem.seals?.up);
        const cardSeals = this.sealsManagerSrv.getCardSeals(sealsList);

        return cardSeals?.[0]?.label || '';
      });
    }
  }

  private getEcProductItemsWarnError(): void {
    const product = this.product as IECProduct;
    const articlesLeftErr = product.errors?.restrictions?.find((elem) => elem.type === 'articlesLeft')?.value;
    const differenceErr = product.errors?.restrictions?.find((elem) => elem.type === 'difference')?.value;

    if (articlesLeftErr || differenceErr) {
      this.showDetail = true;

      if (articlesLeftErr && differenceErr) {
        this.ecProductItemsWarnError = {
          lokaliseKey: articlesLeftErr > 1 ? 'page.ecommerce-minimum-order.text-info.one' : 'page.ecommerce-minimum-order.text-info.other',
          numItems: articlesLeftErr,
          amount: differenceErr,
        };
      } else {
        if (articlesLeftErr) {
          this.ecProductItemsWarnError = {
            lokaliseKey:
              articlesLeftErr > 1
                ? 'page.ecommerce-minimum-order-quantity.text-info.other'
                : 'page.ecommerce-minimum-order-quantity.text-info.one',
            numItems: articlesLeftErr,
          };
        } else if (differenceErr) {
          this.ecProductItemsWarnError = {
            lokaliseKey: 'page.ecommerce-minimum-order-value.text-info',
            amount: differenceErr,
          };
        }
      }
    }

    if (!articlesLeftErr && !differenceErr) {
      this.ecProductItemsWarnError = null;
    }
  }

  private emitUpdate({ cartItem, product, subsConfig, isRefresh }: IProductUpdateParams): void {
    this.update.emit({
      cartItem,
      product: product || this.product,
      ...(subsConfig && { subsConfig }),
      isRefresh: isRefresh ?? true,
    });
  }
}
