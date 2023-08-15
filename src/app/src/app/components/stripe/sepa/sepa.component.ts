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
import { PopupService } from '@services/popup';
import { StripeService, UserService, CheckDataService } from '@app/services';

@Component({
  selector: 'stripe-sepa',
  templateUrl: './sepa.component.html',
  styleUrls: ['./sepa.component.scss'],
})
export class SepaStripeComponent extends BaseComponent implements OnInit, AfterContentChecked, OnChanges {
  @ViewChild('sepaElement', { static: true }) sepaElement: ElementRef;
  @Output() sepaAdded: any = new EventEmitter();
  @Input() isLogged: boolean;
  @Input() stripeRef: any;
  @Input() cancel = false;
  @Input() save = true;
  @Input() askDefault = false;
  @Input() activateToken: boolean;
  @Input() updateMethod: boolean;

  public sepa: any;
  public sepaName: string;
  public sepaErrors: any;
  public sepaAsDefault = false;
  public errorName = false;

  constructor(
    public injector: Injector,
    private stripeSrv: StripeService,
    public userSrv: UserService,
    private checkService: CheckDataService,
    private cdr: ChangeDetectorRef,
    public popupSrv: PopupService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    // Get elements from service
    const elements = this.stripeSrv.get().elements();

    // Set element style
    const style = {
      base: {
        // padding: '2px',
        color: '#32325d',
        fontFamily: 'Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
          fontSize: '16px',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
        fontSize: '14px',
      },
    };

    // Create and mount sepa
    this.sepa = elements.create('iban', { style, supportedCountries: ['SEPA'], hidePostalCode: true });
    this.sepa.mount(this.sepaElement.nativeElement);
    if (this.stripeRef) {
      this.stripeRef.sepa = this.sepa;
    }

    // Add listener on change sepa data
    this.sepa.addEventListener('change', (response) => {
      if (response.error) {
        this.sepaErrors = response.error && response.error.message;
      } else {
        this.sepaErrors = null;
      }
    });
  }

  ngOnChanges(): void {
    if (this.activateToken) {
      if (this.activateToken && !this.sepaErrors && this.updateMethod !== null) {
        void this.createToken();
      }
    } else {
      // Clear form
      if (this.sepa) {
        this.sepa.clear();
      }
      if (this.stripeRef) {
        this.stripeRef.name = '';
      } else {
        this.sepaName = '';
      }
    }
  }

  /**
   * Create sepa token
   */
  public async createToken(): Promise<void | boolean> {
    if (!this.checkName(true)) {
      const params = {
        type: 'sepa_debit',
        currency: 'eur',
        owner: {
          name: this.sepaName,
        },
      };

      const tokenResult = await this.stripeSrv.get().createSource(this.sepa, params);

      if (tokenResult.error) {
        this.sepaAdded.emit({ error: tokenResult.error });
      }

      try {
        await this.userSrv.addSEPA(tokenResult);
        if (this.sepaAsDefault) {
          await this.userSrv.setDefaultPaymentMethod(tokenResult.source.id);
        }
        this.sepaAdded.emit({ id: tokenResult.source.id });
      } catch (e) {
        if (e.msg) {
          this.sepaErrors = this.textSrv.getText(e.msg);
        }
      }

      return true;
    }
  }

  public checkName(savingMethod = false): boolean {
    let name = '';

    if (this.stripeRef) {
      if (this.stripeRef.name) {
        name = this.stripeRef.name;
      }
    } else if (this.sepaName) {
      name = this.sepaName;
    }
    this.errorName = this.checkService.checkPaymentMethodName(this.errorName, name, savingMethod);

    return this.errorName;
  }

  // Need to prevent error
  ngAfterContentChecked(): void {
    this.cdr.detectChanges();
  }
}
