import { Component, OnInit, Injector, Input, EventEmitter, Output, OnChanges } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import dayjs, { Dayjs } from 'dayjs';
import { RouterService, LoaderService, GroupOrderService } from '@app/services';
import { IMAGE_SIZE, ORDER_DELIVERY_STATUS, ORDER_PAYMENT_STATUS, ORDER_TICKET_STATUS } from '@constants/order.constants';
import { BaseComponent } from '@app/components';
import { BreadcrumbItem } from '@components/breadcumbs/breadcrumbs.component';
import { PurchaseInfoStatus, AddressInterface } from '@app/interfaces';
import { IOrderStatusParams, GOParticipant } from '../../interfaces/order.interface';
import { PaymentConfirmationPopupComponent } from '@popups/payment-confirmation-popup/payment-confirmation-popup';
import { GenericPopupComponent } from '@popups/generic-popup';

import { GOInvitationPopupComponent } from '../../../purchase/popups/go-invitation-popup/go-invitation-popup.component';

@Component({
  selector: 'order-group-detail',
  templateUrl: './order-group-detail.component.html',
  styleUrls: ['./order-group-detail.component.scss'],
})
export class OrderGroupDetailComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() public order: any;
  @Input() public ordersInGroup: any;
  @Input() public app: string;
  @Input() public hasBeenCancelled: boolean;
  @Output() checkLoginEvn = new EventEmitter<any>();

  public orderId: string;
  public address: AddressInterface;
  private lang: string;
  private hash: string;
  public assumePayment: boolean;
  public changeAddressAvailable: boolean;
  public ordersPlanned = [];
  public currency: string;
  public isPromoter: boolean;
  public isOutdated: boolean;
  private timeRemaining: number;
  public isAllPaid = false;
  public images = [];
  public formatTime: string;
  public isCancelled: boolean;
  public createDay: Dayjs;
  public formatCreateDay: string;
  public finalDay: Dayjs;
  public breadcrumbs: BreadcrumbItem[] = [];
  public participantsWhoPaid: GOParticipant[] = [];
  public user: any;
  private groupOrderLink: string;
  public imageSize: IMAGE_SIZE;
  public isTimeRemainingHidden = false;

  constructor(
    public injector: Injector,
    public routerSrv: RouterService,
    public groupOrderSrv: GroupOrderService,
    public loaderSrv: LoaderService,
    public translocoSrv: TranslocoService
  ) {
    super(injector);
  }

  async ngOnInit(): Promise<void> {
    await this.checkIfPromoter();
    this.setImages();
    this.currency = this.ordersInGroup[0].currency.crowdfarmer.symbol;
    this.setDaysRemaining();
    this.isOrderCancelled();
    this.areOrdersPlanned();
    this.loadAddress();
    this.setBreadcrumbs();
    this.assumePayment = this.order.promoterAssumesPayment;
    this.isAllPaid = this.order.currentPaid === this.order.totalToPay.amount;
    this.participantsWhoPaid = [this.order.crowdfarmer, ...this.order.guests];
    this.lang = this.langSrv.getCurrentLang();
    this.user = await this.getUser();
    this.imageSize = IMAGE_SIZE.SMALL;
  }

  ngOnChanges(): void {
    this.loadAddress();
  }

  public slots(): number[] {
    const guestsWithoutPay = this.isAllPaid ? 0 : this.order.guestsLimit - this.order.guests.length;

    return Array(guestsWithoutPay);
  }

  public autoLoginValidation(funcName: string, isPromoter = false, isAllPlanned = false, ordersPlanned?: any[]): void {
    this.checkLoginEvn.emit({ funcName, isPromoter, isAllPlanned, ordersPlanned });
  }

  public async checkIfPromoter(): Promise<void> {
    const activeUser = await this.getUser();

    this.isPromoter = activeUser.email === this.order.crowdfarmer.email;
  }

  public moreInfoCheckboxClick(e: MouseEvent): void {
    e.stopPropagation();
    this.popupSrv.open(PaymentConfirmationPopupComponent, {
      data: {
        title: this.translocoSrv.translate('notifications.promoter-assumes-full-payment.title'),
        isBodyHTML: true,
        body: this.translocoSrv.translate('notifications.promoter-assumes-full-payment.body', {
          timeRemaining: this.formatTime,
        }),
        confirm: this.translocoSrv.translate('global.understood.button'),
      },
    });
  }

  public cancelGroupOrder(): void {
    this.autoLoginValidation('cancelOrder', this.isPromoter, this.areOrdersPlanned());
  }

  public setBreadcrumbs(): void {
    this.breadcrumbs = [
      {
        isSelected: false,
        label: 'page.Your-orders.title',
        onClick: () => this.routerSrv.navigateToOrderList(),
      },
      {
        isSelected: true,
        label: 'global.group-order.text-info',
        extraInfo: this.order.purchaseNumber,
      },
    ];
  }

  private areOrdersPlanned(): boolean {
    const ordersPlanned = this.ordersInGroup.filter((order) => order.orderPaymentStatus === ORDER_PAYMENT_STATUS.ORDER_PENDING);

    return ordersPlanned.length === this.ordersInGroup.length;
  }

  public setImages(): void {
    for (const order of this.order.orders) {
      this.images.push(order.pictureURL);
    }
  }

  public async promoterAssumesPayment(): Promise<void> {
    this.assumePayment = !this.assumePayment;

    try {
      await this.groupOrderSrv.promoterAssumesPayment(this.order.id, this.assumePayment);
    } catch {
      this.popupSrv.open(GenericPopupComponent, {
        data: { msg: this.translocoSrv.translate('page.action-not-completed.body'), id: 'assumes-payment' },
      });
      this.assumePayment = !this.assumePayment;
    }
  }

  private loadAddress(): void {
    this.ordersPlanned = this.ordersInGroup.filter((order) => order.orderDeliveryStatus === ORDER_DELIVERY_STATUS.ORDER_PENDING);
    this.changeAddressAvailable = this.ordersPlanned.length >= 1 && !this.isCancelled && this.isPromoter;
    this.address = this.ordersPlanned[0]?.shipment.address || this.setUpdateAddress();
  }

  private setUpdateAddress(): AddressInterface {
    return this.ordersInGroup.sort((a, b) => dayjs(b.updatedAt).valueOf() - dayjs(a.updatedAt).valueOf())[0].shipment.address;
  }

  private setDaysRemaining(): void {
    this.createDay = dayjs(this.order.createdAt);
    this.finalDay = dayjs(this.order.lastPayDay);
    this.timeRemaining = this.finalDay.diff(dayjs(), 'minutes');

    const minutesRemaining = Math.floor(this.timeRemaining % 60);
    const hoursRemaining = Math.floor(this.timeRemaining / 60);

    if (this.order.status === PurchaseInfoStatus.EXPIRED) {
      this.isOutdated = true;
      this.isCancelled = true;
    }

    // Check if the time remaining is over to hide the deadline counter.
    // This line is needed because the change of state delays a little bit and we don't want to show the counter in negative numbers
    this.isTimeRemainingHidden = minutesRemaining <= 0;

    this.formatTime = `${hoursRemaining}h ${minutesRemaining}m`;
    this.formatCreateDay = this.createDay.format('DD/MM/YYYY');
  }

  public isOrderCancelled(): void {
    this.isCancelled = this.isOutdated || this.order.status === PurchaseInfoStatus.CANCELLED;
    this.setCancelStatus();
  }

  public setCancelStatus(): IOrderStatusParams {
    return {
      orderPaymentStatus: ORDER_PAYMENT_STATUS.ORDER_CANCELLED,
      orderTicketStatus: ORDER_TICKET_STATUS.NONE,
      orderDeliveryStatus: undefined,
      orderType: undefined,
    };
  }

  public sendInvitation(): void {
    this.hash = this.order.hash;
    this.groupOrderLink = `${this.env.mainDomain}/${this.lang}/order/go-invitation/${this.hash}`;
    const emailsArr = this.order.invites?.map((elem) => elem.to) ?? [];

    this.popupSrv.open(GOInvitationPopupComponent, {
      data: {
        invitationUrlLink: this.groupOrderLink,
        purchaseInfoId: this.order.id,
        invitationsLimit: this.order.guestsLimit,
        emailsList: emailsArr,
      },
    });
  }

  private async getUser(): Promise<any> {
    return this.user || (await this.userService.get());
  }
}
