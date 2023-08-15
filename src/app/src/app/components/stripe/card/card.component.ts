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
  OnChanges
} from '@angular/core';
import {BaseComponent} from '@components/base';
import {StripeService, UserService, CheckDataService, CountryService} from '@app/services';

@Component({
  selector: 'stripe-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardStripeComponent extends BaseComponent implements OnInit, AfterContentChecked, OnChanges {
  @ViewChild('cardElement', {static: true}) cardElement: ElementRef;
  @Output() cardAdded: any = new EventEmitter();
  @Input() isLogged: boolean;
  @Input() stripeRef: any;
  @Input() cancel = false;
  @Input() save = true;
  @Input() activateToken: boolean;
  @Input() updateMethod: boolean;
  @Input() askDefault = false;

  public card: any;
  public cardName: string;
  public cardErrors: any;
  public errorName = false;
  public stripeSecret: any;
  public cardAsDefault = false;
  public country: string;

  constructor(
    public injector: Injector,
    private stripeSrv: StripeService,
    public userSrv: UserService,
    private checkService: CheckDataService,
    private cdr: ChangeDetectorRef,
    private countrySrv: CountryService
  ) {
    super(injector);
  }

  async ngOnInit(): Promise<void> {

    if (!this.country) {
      this.country = this.countrySrv.getCountry();
    }

    // Get elements from service
    const elements = await this.stripeSrv.get().elements();

    this.stripeSecret = await this.stripeSrv.getSecret();

    // Set element style
    const style = {
      base: {
        // padding: '2px',
        color: '#32325d',
        fontFamily: '"Montserrat", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          fontFamily: '"Montserrat", Helvetica, sans-serif',
          color: 'rgba(0,0,0,.38)',
          fontSize: '16px'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
        fontSize: '14px'
      }
    };

    // Create and mount card
    this.card = elements.create('card', {style, hidePostalCode: true});
    this.card.mount(this.cardElement.nativeElement);

    if (this.stripeRef) {
      this.stripeRef.name = '';
      this.stripeRef.card = this.card;
      this.stripeRef.stripeSecret = this.stripeSecret.client_secret;
    } else {
      this.cardName = '';
    }

    // Add listener on change card data
    this.card.addEventListener('change', (response: any) => {
      if (response.error) {
        this.cardErrors = response.error && response.error.message;
      } else {
        this.cardErrors = null;
      }
    });
  }

   ngOnChanges(): void {
     if (this.activateToken){
      if ( !this.cardErrors && this.updateMethod !== null) {
        void this.createToken();
      }
     } else {
       // Clear form
       if (this.card){
        this.card.clear();
       }
       if (this.stripeRef ){
        this.stripeRef.name = '';
       } else {
        this.cardName = '';
       }
    }
  }

  public async createToken(): Promise<boolean> {

    if (!this.checkName(true)) {
      const cardIntent = await this.stripeSrv.get().handleCardSetup(this.stripeSecret.client_secret, this.card, {
        payment_method_data: {
          billing_details: {name: this.cardName}
        }
      });

      if (cardIntent.error || this.cardErrors) {
        this.cardErrors = cardIntent.error.message;

        return;
      }

      let result: any;

      try {
        result = await this.userSrv.addCreditCard(cardIntent?.setupIntent?.payment_method?.id, this.country);

        if (this.cardAsDefault) {
          await this.userSrv.setDefaultPaymentMethod(cardIntent.setupIntent.payment_method);
        }

        this.cardAdded.emit({id: cardIntent.setupIntent.payment_method});
      } catch (err) {
        result = err;
        this.cardErrors = this.textSrv.getText(result.msg);
      }

      return true;
    }
  }

  public createTokenWithoutSetup(): boolean {
    if (!this.checkName(true)) {
      this.cardAdded.emit({
        card: this.card ,
        payment_method_data: {
          billing_details: {name: this.stripeRef ? this.stripeRef.name : this.cardName}
        }
      });

      return true;
    }
  }

  public checkName(savingMethod = false): boolean {
    let name = '';

    if (this.stripeRef) {
      if (this.stripeRef.name) {
        name = this.stripeRef.name;
      }
    } else if (this.cardName) {
      name = this.cardName;
    }
    this.errorName = this.checkService.checkPaymentMethodName(this.errorName, name, savingMethod);

    return this.errorName;
  }

  // Need to prevent error
  ngAfterContentChecked(): void {
    this.cdr.detectChanges();
  }
}
