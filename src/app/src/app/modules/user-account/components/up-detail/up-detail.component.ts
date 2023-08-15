import { Component, Injector, Input, Output, EventEmitter, OnChanges, HostListener } from '@angular/core';
import { OrdersService, ProductService } from '@app/services';
import { BaseComponent } from '@app/components';

@Component({
  selector: 'up-detail',
  templateUrl: './up-detail.component.html',
  styleUrls: ['./up-detail.component.scss'],
})
export class UpDetailComponent extends BaseComponent implements OnChanges {
  @Input() public orders: any;
  @Input() public order: any;
  @Input() public upCfId: string;
  @Output() public pagination = new EventEmitter<any>();
  @Output() public checkLoginEvn = new EventEmitter<any>();

  public isMobile: boolean;
  public currentPage = 1;
  public totalPages = 0;
  public start = 0;
  public orderIdx: any;

  @HostListener('window:resize', ['$event'])
  onResize(e: any): void {
    if (e.target.innerWidth >= 768 && this.isMobile) {
      void this.sizeConfig();
    } else if (e.target.innerWidth < 768 && !this.isMobile) {
      void this.sizeConfig();
    }
    this.isMobile = e.target.innerWidth < 768;
  }

  constructor(public injector: Injector, public ordersSrv: OrdersService, public productSrv: ProductService) {
    super(injector);
  }

  ngOnChanges(): void {
    this.totalPages = Math.ceil(this.orders.count / 10);
  }

  /**
   * allowes to pass pages in descktop size
   */
  public paginate(e: number): void {
    this.currentPage = e;
    this.pagination.emit({
      start: (this.currentPage - 1) * 10,
    });

    setTimeout(() => {
      this.domSrv.scrollToTop();
    }, 100);
  }

  /**
   * loads more orders when scrolling over the end of current orders
   */
  public async onScroll(): Promise<void> {
    if (this.domSrv.getIsDeviceSize()) {
      if (this.orders.count > this.orders.length) {
        this.start += 10;
        const moreOrders = await this.ordersSrv.getByUpCf(this.upCfId, this.start);

        // Ger order type
        this.orders.map((order: any) => this.productSrv.productType(order));
        // Checks current order delivery status if not cancelled
        this.ordersSrv.assingOrderStatus(this.orders);
        this.orders.count += moreOrders.count;
        this.orders = [...this.orders, ...moreOrders];
      }
    }
  }

  /**
   * restart info on resize events
   */
  public async sizeConfig(): Promise<void> {
    this.currentPage = 1;
    this.start = 0;
    this.orders = await this.ordersSrv.getByUpCf(this.upCfId, this.start);
    // Ger order type
    this.orders.map((order: any) => this.productSrv.productType(order));
    // Checks current order delivery status if not cancelled
    this.ordersSrv.assingOrderStatus(this.orders);
  }

  public openRejectionPopup(): void {
    this.popupSrv.open('AdoptionPopupComponent', {
      data: {
        header: this.textSrv.getText('rejected payment header'),
        msg: this.textSrv.getText('rejected payment msg'),
      },
    });
  }

  /**
   * Gets the index of the order to be updated
   */
  public async detailInUp(i: number): Promise<void> {
    this.order = await this.ordersSrv.get(this.orders[i]._id, true);
  }

  public autoLoginValidation(e: any): void {
    this.checkLoginEvn.emit(e);
  }
}
