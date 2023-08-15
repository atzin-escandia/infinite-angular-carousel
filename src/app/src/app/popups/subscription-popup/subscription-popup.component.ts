import {Component, OnInit} from '@angular/core';
import {PopupsInterface} from '../popups.interface';
import {PopupsRef} from '../popups.ref';
import {DomService, EventService, RouterService, SubscriptionService, UtilsService} from '../../services';
import {ISubscriptionAvailability, ISubscriptionConfiguration, ISubscriptionOption} from '../../interfaces/subscription.interface';
import {PopoverService} from '../../services/popover';

const BASE_ID = 'subscription-popup';

@Component({
  selector: 'subscription-popup',
  templateUrl: './subscription-popup.html',
  styleUrls: ['./subscription-popup.scss'],
})
export class SubscriptionPopupComponent implements OnInit {
  public subscriptionAvailability: ISubscriptionAvailability;
  public subscriptionOption: ISubscriptionConfiguration;
  public isOpenSubscriptionCalendar = false;
  public id = BASE_ID;
  public onClose?: any;
  public selectedDate: string;

  private onAddToCart: (subscription: ISubscriptionConfiguration) => void;

  constructor(
    public config: PopupsInterface,
    public popoverSrv: PopoverService,
    public popup: PopupsRef,
    public routerSrv: RouterService,
    public domSrv: DomService,
    public eventSrv: EventService,
    public utilsSrv: UtilsService,
    private subscriptionSrv: SubscriptionService,
  ) {}

  ngOnInit(): void {
    this.initVars();
  }

  handleChangeSubscription(subscriptionOption: ISubscriptionConfiguration): void {
    this.subscriptionOption = subscriptionOption;
  }

  handleClickBuyNow(): void {
    this.onAddToCart(this.subscriptionOption);
    this.closePopup();
    this.popoverSrv.close('CrossSellingPopoverComponent');
    this.routerSrv.navigateToOrderSection('cart');
  }

  closePopup(): void {
    this.eventSrv.dispatchEvent(this.id, false);
    this.isOpenSubscriptionCalendar = false;

    this.onClose(null, () => {
      if (this.config.data.onClose) {
        this.config.data.onClose();
      }
    });
  }

  private initVars(): void {
    if (this.config.data.id) {
      this.id += '-' + this.config.data.id;
    }

    this.onAddToCart = this.config.data.onAddToCart;
    this.subscriptionAvailability = this.config.data.subscriptionAvailability;
    this.selectedDate = this.config.data.selectedDate;
    this.subscriptionOption = this.getDefaultSubscriptionConfig();
  }

  private getDefaultSubscriptionConfig(): ISubscriptionConfiguration {
    const defaultFrequency: ISubscriptionOption = this.subscriptionAvailability?.options[0];
    const options = this.subscriptionSrv.getOptions(defaultFrequency, this.subscriptionAvailability);

    return this.subscriptionSrv.getSelectorDefaultConfig(
      defaultFrequency,
      this.selectedDate,
      options
    );
  }
}
