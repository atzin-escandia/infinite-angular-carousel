import { Component, OnInit, Injector, OnDestroy, HostBinding, ViewEncapsulation } from '@angular/core';
import { PopoverBaseComponent } from '../base/base.component';
import { RouterService, ProductService, LangService, CrossSellingService } from '@app/services';
import {
  CS_MODAL_FARMER_PAGE_ACTION_NAME,
  CS_MODAL_FARMER_PAGE_LIST_NAME,
} from '@pages/farmer/overharvest/constants/overharvest.constants';
import { CROSS_SELLING_LOCATIONS, CS_MINI_CART } from '@constants/cross-selling.constants';

const CLOSE_ANIMATION_TIME = 300;

@Component({
  selector: 'cross-selling-popover',
  templateUrl: './cross-selling-popover.component.html',
  styleUrls: ['./cross-selling-popover.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CrossSellingPopoverComponent extends PopoverBaseComponent implements OnInit, OnDestroy {
  @HostBinding('class.popover-is-open') isOpen;
  public country: string;
  public product: any;
  public imageURL: string;
  public customClose: any;
  public getUnit: string;
  public boxesInfo: string;
  public isCsActive = false;
  public csParams: any = {};
  public csSpecifications: any = {
    ohProjects: {
      header: 'http://page.youmight-also-like.body', // Lokalise key
      trackingListName: CS_MODAL_FARMER_PAGE_LIST_NAME,
      trackingGA4ListName: CS_MINI_CART,
    },
    trackingActionName: CS_MODAL_FARMER_PAGE_ACTION_NAME,
  };

  constructor(
    public injector: Injector,
    public routerSrv: RouterService,
    public productSrv: ProductService,
    public langSrv: LangService,
    private crossSellingSrv: CrossSellingService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    // Load Cross Selling Active Params from Firebase
    this.crossSellingSrv.isCsActive(CROSS_SELLING_LOCATIONS.OH_ADD_TO_CART).subscribe(() => {
      this.isCsActive = true;
    });
    this.productSrv.productType(this.product);
    this.start({
      active: true,
      style: 'opacity: 0.24; background-color: #1a1a1a; z-index: 200',
      close: () => {
        this.closeWithAnimation();
      },
    });

    setTimeout(() => {
      this.isOpen = true;
    }, 0);

    if (this.product.up.selectedMasterBox?._m_weightUnit) {
      const currentLang = this.langSrv.getCurrentLang();

      this.getUnit = this.product.up.selectedMasterBox._m_weightUnit[currentLang];
    }

    const boxes = `${this.product.boxes as string} ${this.textSrv.getText('boxes')}`;

    this.boxesInfo =
      !this.product.oneShotRenew && !this.product.oneShot
        ? `${boxes} (${this.utilsSrv.numberForFront(this.product.up.selectedMasterBox?.weight * this.product.boxes)} ${this.getUnit})`
        : '';
  }

  /**
   * Goes to cart
   */
  public goToCart(): void {
    this.closeWithAnimation();
    this.routerSrv.navigateToOrderSection('cart');
  }

  ngOnDestroy(): void {
    this.isOpen = false;
  }

  /**
   * Close popover
   */
  public closeWithAnimation(): void {
    this.isOpen = false;

    setTimeout(() => {
      this.close();
      if (this.customClose) {
        this.customClose();
      }
    }, CLOSE_ANIMATION_TIME);
  }
}
