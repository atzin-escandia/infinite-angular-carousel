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
  OnChanges,
} from '@angular/core';
import { BaseComponent } from '@components/base';
import { StripeService, UserService, CheckDataService } from '@app/services';

@Component({
  selector: 'stripe-ideal',
  templateUrl: './ideal.component.html',
  styleUrls: ['./ideal.component.scss'],
})
export class IdealStripeComponent extends BaseComponent implements OnInit, AfterContentChecked, OnChanges {
  public isMobile: boolean;
  @ViewChild('idealElement', { static: true }) idealElement: ElementRef;
  @ViewChild('SelectFieldButton', { static: true })
  idealElementInput: ElementRef;
  @Output() idealAdded: any = new EventEmitter();
  @Input() isLogged: boolean;
  @Input() stripeRef: any;
  @Input() cancel = false;
  @Input() save = true;
  @Input() askDefault = false;
  @Input() user: any = null;
  @Input() activateToken: boolean;
  @Input() updateMethod: boolean;

  public ideal: any;
  public completedOption: any;
  public inputValue: any;
  public idealName: string;
  public idealErrors: any;
  public errorName = false;
  public setHeight: string;
  public stripeSecret: any;
  public idealAsDefault = false;

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
    this.isMobile = this.domSrv.getIsDeviceSize();

    // Get elements from service
    const elements = await this.stripeSrv.get().elements();

    this.stripeSecret = await this.stripeSrv.getSecret('ideal');

    // Set element style
    const style = {
      base: {
        padding: '14px 6px 14px 16px',
        color: '#32325d',
        height: '500px',
        fontFamily: '"Montserrat", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          fontFamily: '"Montserrat", Helvetica, sans-serif',
          color: 'rgba(0,0,0,.38)',
          fontSize: '16px',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
        fontSize: '14px',
      },
    };

    // Create and mount ideal

    this.ideal = elements.create('idealBank', { style, hidePostalCode: true });
    this.ideal.mount(this.idealElement.nativeElement);
    if (this.stripeRef) {
      this.stripeRef.ideal = this.ideal;
      this.stripeRef.name = '';
      this.stripeRef.stripeSecret = this.stripeSecret.client_secret;
    }

    // Add listener on blur ideal data
    this.ideal.addEventListener('focus', () => {
      if ((this.inputValue === undefined && this.completedOption === undefined) || (this.inputValue && this.completedOption === false)) {
        this.setHeight = 'open';
      }
      if (this.inputValue && this.completedOption === true) {
        this.ideal.blur();
      }
      if (this.isMobile) {
        this.setHeight = 'close';
      }
    });

    // Add listener on change ideal data
    this.ideal.addEventListener('change', (response: any) => {
      this.completedOption = response.complete;
      this.inputValue = response.value;

      if (response.complete === true) {
        this.setHeight = 'close';
        this.completedOption = true;
      }

      if (response.error) {
        this.idealErrors = response.error && response.error.message;
      } else {
        this.idealErrors = null;
      }
    });

    // Add listener on blur ideal data
    this.ideal.addEventListener('blur', () => {
      if (this.inputValue === undefined) {
        this.setHeight = 'open';
        this.completedOption = true;
      } else {
        this.setHeight = 'close';
        this.completedOption = false;
      }
    });
  }

  ngOnChanges(): void {
    if (this.activateToken) {
      if (!this.idealErrors && this.updateMethod !== null) {
        void this.createToken();
      }
    } else {
      // Clear form
      this.idealErrors = '';
      if (this.stripeRef) {
        this.stripeRef.name = '';
      } else {
        this.idealName = '';
      }
    }
  }

  public async createToken(): Promise<void> {
    const path = window.location.href;

    if (!this.checkName(true)) {
      const user_id = this.user._id as string;

      await this.stripeSrv.get().confirmIdealSetup(this.stripeSecret.client_secret, {
        payment_method: {
          ideal: this.ideal,
          billing_details: {
            name: this.idealName,
            email: this.user.email,
          },
        },
        // eslint-disable-next-line max-len
        return_url: `${path}?profile_id=${user_id}&set_fav=${this.idealAsDefault ? 'true' : 'false'}&payment_type=ideal`,
      });
    }
  }

  public checkName(savingMethod = false): boolean {
    let name = '';

    if (this.stripeRef) {
      if (this.stripeRef.name) {
        name = this.stripeRef.name;
      }
    } else if (this.idealName) {
      name = this.idealName;
    }
    this.errorName = this.checkService.checkPaymentMethodName(this.errorName, name, savingMethod);

    return this.errorName;
  }

  // Need to prevent error
  ngAfterContentChecked(): void {
    this.cdr.detectChanges();
  }
}
