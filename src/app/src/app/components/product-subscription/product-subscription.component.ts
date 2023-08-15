import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { UnknownObjectType } from '@app/interfaces';
import { ISubscriptionAvailability, ISubscriptionConfiguration } from '@interfaces/subscription.interface';
import { CartsService, SubscriptionService } from '@app/services';

@Component({
  selector: 'product-subscription',
  templateUrl: './product-subscription.component.html',
  styleUrls: ['./product-subscription.component.scss'],
})
export class ProductSubscriptionComponent implements OnInit {
  @Input() index: number;
  @Input() product: any;
  @Input() canEdit: boolean;
  @Input() isInCheckout: boolean;
  @Input() productSubscription: any;
  @Input() cart?: UnknownObjectType[];

  @Output() subscriptionOnChange = new EventEmitter<{ cartItem: UnknownObjectType; config: ISubscriptionConfiguration }>();

  subscriptionActive: boolean;
  subscriptionConfig: ISubscriptionConfiguration;
  currentSubscription: ISubscriptionAvailability;
  activeCartInfo: UnknownObjectType;
  subscriptionAvailability: ISubscriptionAvailability;

  constructor(private cartSrv: CartsService, private subscriptionSrv: SubscriptionService) {}

  ngOnInit(): void {
    this.subscriptionAvailability = this.product.subscription;
    this.activeCartInfo = this.cart ? this.cart[this.index] : this.cartSrv.getByIdx(this.index);
    this.setCurrentSubscriptionOnInit();
    this.setSubscriptionConfigOnInit();
  }

  activateSubscription(isActive: boolean): void {
    this.currentSubscription.active = isActive;
    this.activeCartInfo = { ...this.activeCartInfo, subscription: { isActive } };
    this.emitData();
  }

  handleChangeSubscription(subscriptionConfig: ISubscriptionConfiguration): void {
    this.subscriptionConfig = subscriptionConfig;
    this.emitData();
  }

  private setCurrentSubscriptionOnInit(): void {
    this.currentSubscription = {
      active: this.activeCartInfo?.subscription?.isActive,
      options: [
        {
          frequency: this.activeCartInfo?.subscription?.frequency,
          units: this.activeCartInfo?.subscription?.units,
          dates: [this.activeCartInfo?.selectedDate],
        },
      ],
    };
  }

  private setSubscriptionConfigOnInit(): void {
    const defaultFrequency = this.subscriptionAvailability?.options[0];
    const options = this.subscriptionSrv.getOptions(defaultFrequency, this.subscriptionAvailability);
    const selectedDate = this.subscriptionSrv.getSelectedDate(defaultFrequency, null);

    this.subscriptionConfig = this.subscriptionSrv.getSelectorDefaultConfig(
      defaultFrequency,
      selectedDate,
      options,
      this.currentSubscription,
    );
  }

  private emitData(): void {
    this.subscriptionOnChange.emit({
      cartItem: this.activeCartInfo,
      config: this.subscriptionConfig,
    });
  }
}
