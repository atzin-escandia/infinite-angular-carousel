import { Component, OnInit, Injector, Input, EventEmitter, Output, OnChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { EventService, CountryService, RouterService, LoaderService, LangService } from '@app/services';
import { PopoverService } from '@services/popover';
import { SUBSCRIPTION_STATUS } from '@constants/order.constants';
import { BaseComponent } from '@app/components';
import { BreadcrumbItem } from '@components/breadcumbs/breadcrumbs.component';
import { AddressInterface } from '@interfaces/farmer.interface';
import { ISubscriptionOrderDetail, ISubscriptionFrequency } from '@interfaces/subscription.interface';

@Component({
  selector: 'subscription-detail',
  templateUrl: './subscription-detail.component.html',
  styleUrls: ['./subscription-detail.component.scss'],
})
export class SubscriptionDetailComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() public subscription: ISubscriptionOrderDetail;
  @Input() public app: string;
  @Output() checkLoginEvn = new EventEmitter<any>();
  @Output() changePage = new EventEmitter<number>();

  public breadcrumbs: BreadcrumbItem[] = [];

  public user: string;
  public name: string;
  public deliveryInfo = [];
  public pageLimit = 5;
  public totalPages: number;
  public country: string;
  public farmCountry: string;
  public address: AddressInterface;
  public isInProgress: boolean;
  public numOfBoxes: string;

  constructor(
    public injector: Injector,
    public routerSrv: RouterService,
    public langSrv: LangService,
    public popoverSrv: PopoverService,
    public countrySrv: CountryService,
    public eventSrv: EventService,
    public loaderSrv: LoaderService,
    public activatedRoute: ActivatedRoute,
    public translocoSrv: TranslocoService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.setDeliveryInfo();
    this.setBreadcrumbs();
    this.totalPages = Math.ceil(this.subscription.orders.count / this.pageLimit);
    this.isInProgress = this.subscription.status === SUBSCRIPTION_STATUS.IN_PROGRESS;
    this.address = this.subscription.shipment;
    this.numOfBoxes = this.subscription.orders.list[0].shipment.boxes.length;
  }

  async ngOnChanges(): Promise<void> {
    this.setOrderSchema();
    await this.setCountry();
  }

  public autoLoginValidation(funcName: string): void {
    this.checkLoginEvn.emit({ funcName });
  }

  public setDeliveryInfo(): void {
    let frequencyInfo = this.translocoSrv.translate('global.every-day-frequency.text-info', {
      number: this.subscription.subscriptionOptions.units,
    });

    if (this.subscription.subscriptionOptions.frequency === ISubscriptionFrequency.WEEK) {
      frequencyInfo =
        this.subscription.subscriptionOptions.units === 1
          ? this.translocoSrv.translate('global.weekly-frequency.text-info')
          : this.translocoSrv.translate('global.every-week-frequency.text-info', { number: this.subscription.subscriptionOptions.units });
    }

    const boxesInfo = this.subscription.orders.delivered + '/' + this.subscription.orders.count;

    if (this.subscription.status !== SUBSCRIPTION_STATUS.CANCELLED) {
      this.deliveryInfo = [
        { icon: 'eva-calendar-outline', title: 'page.recurrent-order-modal-frequency.drop', data: frequencyInfo },
        { icon: 'eva-car-outline', title: 'page.next-delivery.body', data: this.utilsSrv.dateForFront(this.subscription.nextDeliveryDate) },
        {
          icon: 'cf-icon-farmer',
          title: 'global.end-season.text-info',
          data: this.utilsSrv.dateForFront(this.subscription.shippingEndDate),
        },
        { icon: 'eva-shopping-bag-outline', title: 'page.delivered-boxes.text-info', data: boxesInfo },
      ];
    }
  }

  public setBreadcrumbs(): void {
    this.breadcrumbs = [
      {
        isSelected: false,
        label: 'page.Your-orders.title',
        onClick: () => this.routerSrv.navigate('private-zone/my-order/list'),
      },
      {
        isSelected: true,
        label: 'global.recurrent-orders.tab',
        extraInfo: this.subscription.subscriptionNumber,
      },
    ];
  }

  // set necessary data for order card component. We use the same info than subscription.

  private setOrderSchema(): void {
    let orderCopy = [];

    this.subscription.orders.list.map((order) => {
      orderCopy = [
        ...orderCopy,
        (order = {
          ...order,
          _m_name: this.subscription._m_name,
          _m_farmName: this.subscription._m_farmName,
          farmerName: this.subscription.farmerName,
          pictureURL: this.subscription.pictureURL,
          subscription: true,
        }),
      ];
    });

    this.subscription.orders.list = orderCopy;
  }

  public paginate(page: number): void {
    this.changePage.emit(page);
  }

  public async setCountry(): Promise<void> {
    this.farmCountry = await this.countrySrv.getCountryByIso(this.subscription.farmCountry);
    this.country = await this.countrySrv.getCountryByIso(this.subscription.shipment.country);
  }
}
