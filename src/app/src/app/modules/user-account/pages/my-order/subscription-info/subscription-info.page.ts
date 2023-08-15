import {Component, OnInit, Injector} from '@angular/core';
import {BasePage} from '../../../../../pages';
import {CountryService, EventService, SubscriptionService} from '../../../../../services';
import {PopoverService} from '../../../../../services/popover';
import {OrderAddressPopupComponent} from '../../../../../popups/order-address-popup';
import {GenericPopupComponent} from '../../../../../popups/generic-popup';
import {TranslocoService} from '@ngneat/transloco';
import {ISubscriptionOrderDetail} from '../../../../../interfaces/subscription.interface';
import {CancelSubscriptionPopupComponent} from '../../../popups/cancel-subscription-popup/cancel-subscription-popup';
import {StatusPopupComponent} from '../../../../../popups/status-popup';

@Component({
  selector: 'subscription-info',
  templateUrl: './subscription-info.page.html',
  styleUrls: ['./subscription-info.page.scss'],
})
export class SubscriptionInfoPageComponent extends BasePage implements OnInit {
  public subscriptionId: string;
  public subscription: ISubscriptionOrderDetail;
  public countriesByIso: any;
  public changeAddressPopup: any;
  public orderStatus: string;
  public availableDates: any;
  public currentPage = 0;

  constructor(
    public injector: Injector,
    public popoverSrv: PopoverService,
    public countrySrv: CountryService,
    public eventSrv: EventService,
    public translocoSrv: TranslocoService,
    public subscriptionSrv: SubscriptionService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.route.params.subscribe(async (params) => await this.processParams(params));
  }

  public async processParams(params: any): Promise<void> {
    this.setInnerLoader(true, true);
    this.subscriptionId = params.subscriptionId;

    try {
      await this.getSubscriptionInfo();
    } catch (error) {
      this.popupSrv.open(GenericPopupComponent, {
        data: {
          msg: error.msg,
        },
      });
    }
    this.countriesByIso = await this.countrySrv.getCountriesByISO();
    // Let private zone menu know that this component is open
    this.eventSrv.dispatchEvent('private-zone-url', {router: this.routerSrv.getPath()});
    this.setLoading(false);
    this.setInnerLoader(false, false);
  }

  public changeAddressInfo(): void {
    this.changeAddressPopup = this.popupSrv.open(OrderAddressPopupComponent, {
      data: {
        order: this.subscription,
        user: this.user,
        countriesByIso: this.countriesByIso,
      },
    });

    this.changeAddressPopup.onClose.subscribe(async (result) => {
      if (result) {
        this.subscription = null;
        this.popupSrv.open(GenericPopupComponent, {
          data: {msg: this.translocoSrv.translate(result), id: 'change-address'},
        });
        this.subscription = await this.subscriptionSrv.getSubscriptionDetail(this.subscriptionId, this.currentPage);
        this.domSrv.scrollToTop();
      }
    });
  }

  public async handlePagination(event: any): Promise<void> {
    this.setInnerLoader(true, false);
    this.currentPage = event - 1;
    await this.getSubscriptionInfo();
    this.domSrv.scrollToTop();
    this.setInnerLoader(false, false);
  }

  public autoLoginValidation(e: any): void {
    void this.checkLogin(() => this[e.funcName]());
  }

  public async getSubscriptionInfo(): Promise<void> {
    this.subscription = await this.subscriptionSrv.getSubscriptionDetail(this.subscriptionId, this.currentPage);
  }

  public cancelOrder(): void {
    this.setInnerLoader(false, true);
    let popup = this.popupSrv.open(CancelSubscriptionPopupComponent, {
      data: {
        id: this.subscriptionId,
      },
    });

    popup.onClose.subscribe(async (result) => {
      if (result) {
        try {
          this.setInnerLoader(true, true);
          await this.getSubscriptionInfo();
          this.setInnerLoader(false, true);
          this.routerSrv.navigate('private-zone/my-order/list');
          popup = this.popupSrv.open(StatusPopupComponent, {data: {msgSuccess: 'cancel success'}});
        } catch (err) {
          this.setInnerLoader(false, true);
          this.showPopupError();
        }
      } else if (result === false) {
        this.showPopupError();
      }
    });
  }

  private showPopupError(): void {
    this.popupSrv.open(StatusPopupComponent, {
      data: {
        err: true,
        msgError: this.translocoSrv.translate('page.action-not-completed.body'),
      },
    });
  }
}
