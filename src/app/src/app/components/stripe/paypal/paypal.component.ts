import {
  Component,
  OnInit,
  Injector,
  Input,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  AfterContentChecked,
  ChangeDetectorRef,
} from '@angular/core';
import { BaseComponent } from '@components/base';
import { StripeService, UserService, CheckDataService } from '@app/services';

@Component({
  selector: 'stripe-paypal',
  templateUrl: './paypal.component.html',
  styleUrls: ['./paypal.component.scss'],
})
export class PaypalStripeComponent extends BaseComponent implements OnInit, AfterContentChecked {
  @ViewChild('paypalElement', { static: true }) paypalElement: ElementRef;
  @Output() paypalAdded: any = new EventEmitter();
  @Input() isLogged: boolean;
  @Input() stripeRef: any;
  @Input() user: any;
  @Input() cancel = false;
  @Input() save = true;
  @Input() askDefault = false;
  @Input() activateToken: boolean;
  @Input() updateMethod: boolean;

  public paypal: any;
  public paypalName: string;
  public paypalEmail: string;
  public paypalErrors: any;
  public errorName = false;
  public stripeSecret: any;
  public paypalAsDefault = false;

  constructor(
    public injector: Injector,
    private stripeSrv: StripeService,
    public userSrv: UserService,
    private checkService: CheckDataService,
    private cdr: ChangeDetectorRef
  ) {
    super(injector);
  }

  async ngOnInit(): Promise<void> {
    // Get elements from service
    this.stripeSecret = await this.stripeSrv.getSecret('paypal');

    if (!this.user) {
      this.user = await this.userSrv.get();
    }
  }

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnChanges(): void {
    if (this.activateToken) {
      if (this.activateToken && !this.paypalErrors && this.updateMethod !== null) {
        void this.createToken();
      }
    }
  }

  public async createToken(): Promise<void> {
    const path = window.location.href;
    const userId = this.user._id as string;

    const returnUrl = `${path}?profile_id=${userId}&set_fav=${this.paypalAsDefault ? 'true' : 'false'}&payment_type=paypal`;

    try {
      this.paypal = await this.stripeSrv.createPaymentMethod({ card: {}, type: 'paypal' });

      await this.stripeSrv.get().confirmPayPalSetup(this.stripeSecret.client_secret, {
        payment_method: this.paypal.id,
        return_url: returnUrl,
        mandate_data: {
          customer_acceptance: {
            type: 'online',
            online: {
              infer_from_client: true,
            },
          },
        },
      });
    } catch (e) {
      if (e.msg) {
        this.paypalErrors = this.textSrv.getText(e.msg);
      }
    }
  }

  public async paypalProcess(): Promise<void | boolean> {
    try {
      return await this.stripeSrv.createPaymentMethod({ card: {}, type: 'paypal' });
      // As we can't use recursive payments, we don't save the PayPal method on the user account for the moment.
      // await this.userSrv.addPayPal(paymentMethod, country);
      // return paymentMethod;
    } catch (error) {
      console.log(error);
    }
  }

  async syncPaymentMethods(): Promise<boolean> {
    this.user.paymentMethods = await this.userSrv.getPaymentMethods();

    return true;
  }

  // Need to prevent error
  ngAfterContentChecked(): void {
    this.cdr.detectChanges();
  }
}
