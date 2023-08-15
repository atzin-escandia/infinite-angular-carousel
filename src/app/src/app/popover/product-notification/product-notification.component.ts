import {Component, OnInit, Injector, OnDestroy, ViewEncapsulation, HostBinding} from '@angular/core';
import {PopoverBaseComponent} from '../base/base.component';
import {RouterService, ProductService, LangService} from '../../services';

@Component({
  selector: 'product-notification',
  templateUrl: './product-notification.component.html',
  styleUrls: ['./product-notification.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProductNotificationComponent extends PopoverBaseComponent implements OnInit, OnDestroy {
  @HostBinding('class.popover-is-open') isOpen;
  public country: string;
  public product: any;
  public imageURL: string;
  public customClose: any;
  public getUnit: string;
  constructor(public injector: Injector, public routerSrv: RouterService, public productSrv: ProductService, public langSrv: LangService) {
    super(injector);
  }

  ngOnInit(): void {
    this.productSrv.productType(this.product);
    this.start({
      active: true,
      style: 'opacity: 0.24; background-color: #1a1a1a;',
      close: () => {
        this.closeWithAnimation();
      }
    });

    setTimeout(() => {
      this.isOpen = true;
    }, 0);

    setTimeout(() => {
      this.closeWithAnimation();
    }, 5000);

    if (this.product.up.masterBox._m_weightUnit) {
      const currentLang = this.langSrv.getCurrentLang();

      this.getUnit = this.product.up.masterBox._m_weightUnit[currentLang];
    }
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
    }, 300);
  }
}
