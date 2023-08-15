import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { CurrencyType } from '../../../../constants/app.constants';
import {
  IAllowedPaymentMethods,
  IPaymentMethodMapToElem,
  IAddress,
  ICountry,
  UserInterface,
  IPurchaseCart,
  IPurchaseInfo,
  UnknownObjectType,
} from '../../../../interfaces';
import { CountryService } from '../../../../services';
import { PAYMENT_METHOD } from '../../constants/payment-method.constants';
import { ICheckoutSection, MaxBoxesPerAdoption } from '../../interfaces/checkout.interface';
import { IProductsInfoTotal } from '../../interfaces/product.interface';

export type CheckoutStoreKeyType =
  | 'sections'
  | 'cartSections'
  | 'sectionQuery'
  | 'isPageLoaded'
  | 'user'
  | 'isUserLogged'
  | 'invalidShipmentCountry'
  | 'countriesByIso'
  | 'currentIso'
  | 'currentCurrency'
  | 'products'
  | 'hasUnavailableProducts'
  | 'currentSectionIdx'
  | 'summaryOpen'
  | 'price'
  | 'finalPrice'
  | 'userAddresses'
  | 'selectedUserAddressId'
  | 'availablePaymentMethods'
  | 'selectedPaymentMethod'
  | 'allowedPaymentMethods'
  | 'stripeRef'
  | 'shipperMsg'
  | 'dedicatoryMsg'
  | 'isGroupOrderAvailable'
  | 'isGroupOrder'
  | 'isGroupOrderGuestPaymentMode'
  | 'cart'
  | 'isCartInvalid'
  | 'purchaseInfo'
  | 'credits'
  | 'creditsToSpend'
  | 'showCreditsTooltip'
  | 'productsInfoTotal'
  | 'isCreditsAvailable'
  | 'isProductSubscriptionAvailable'
  | 'isAnyProductSubscriptionActive'
  | 'isProductGiftAvailable';

@Injectable()
export class CheckoutStoreService {
  public sections: ICheckoutSection[] = [];
  public cartSections: string[] = [];
  public subscriptions: Subscription;

  get sectionQuery(): string {
    return this.activatedRoute.snapshot.queryParams.section;
  }

  private readonly _isPageLoaded$ = new BehaviorSubject<boolean>(false);
  readonly isPageLoaded$ = this._isPageLoaded$.asObservable();
  get isPageLoaded(): boolean {
    return this._isPageLoaded$.getValue();
  }

  private readonly _user$ = new BehaviorSubject<UserInterface>(null);
  readonly user$ = this._user$.asObservable();
  get user(): UserInterface {
    return this._user$.getValue();
  }

  private readonly _isUserLogged$ = new BehaviorSubject<boolean>(false);
  readonly isUserLogged$ = this._isUserLogged$.asObservable();
  get isUserLogged(): boolean {
    return this._isUserLogged$.getValue();
  }

  private readonly _invalidShipmentCountry$ = new BehaviorSubject<boolean>(false);
  readonly invalidShipmentCountry$ = this._invalidShipmentCountry$.asObservable();
  get invalidShipmentCountry(): boolean {
    return this._invalidShipmentCountry$.getValue();
  }

  private readonly _countriesByIso$ = new BehaviorSubject<{ [key: string]: ICountry }>({});
  readonly countriesByIso$ = this._countriesByIso$.asObservable();
  get countriesByIso(): { [key: string]: ICountry } {
    return this._countriesByIso$.getValue();
  }

  private readonly _currentIso$ = new BehaviorSubject<string>('');
  readonly currentIso$ = this._currentIso$.asObservable();
  get currentIso(): string {
    return this._currentIso$.getValue();
  }

  private readonly _currentCurrency$ = new BehaviorSubject<CurrencyType>(null);
  readonly currentCurrency$ = this._currentCurrency$.asObservable();
  get currentCurrency(): CurrencyType {
    return this._currentCurrency$.getValue();
  }

  private readonly _products$ = new BehaviorSubject<UnknownObjectType[]>([]);
  readonly products$ = this._products$.asObservable();
  get products(): UnknownObjectType[] {
    return this._products$.getValue();
  }
  get hasMSSingleBoxesProducts(): boolean {
    return this.products.map((elem) => elem.type).includes('MULTI_SHOT_SINGLE_BOXES');
  }

  private readonly _hasUnavailableProducts$ = new BehaviorSubject<boolean>(false);
  readonly hasUnavailableProducts$ = this._hasUnavailableProducts$.asObservable();
  get hasUnavailableProducts(): boolean {
    return this._hasUnavailableProducts$.getValue();
  }

  private readonly _currentSectionIdx$ = new BehaviorSubject<number>(0);
  readonly currentSectionIdx$ = this._currentSectionIdx$.asObservable();
  get currentSectionIdx(): number {
    return this._currentSectionIdx$.getValue();
  }

  private readonly _summaryOpen$ = new BehaviorSubject<boolean>(false);
  readonly summaryOpen$ = this._summaryOpen$.asObservable();
  get summaryOpen(): boolean {
    return this._summaryOpen$.getValue();
  }

  private readonly _price$ = new BehaviorSubject<number>(0);
  readonly price$ = this._price$.asObservable();
  get price(): number {
    return this._price$.getValue();
  }

  private readonly _finalPrice$ = new BehaviorSubject<number>(0);
  readonly finalPrice$ = this._finalPrice$.asObservable();
  get finalPrice(): number {
    return this._finalPrice$.getValue();
  }

  private readonly _userAddresses$ = new BehaviorSubject<IAddress[]>([]);
  readonly userAddresses$ = this._userAddresses$.asObservable();
  get userAddresses(): IAddress[] {
    return this._userAddresses$.getValue();
  }

  private readonly _selectedUserAddressId$ = new BehaviorSubject<string>(null);
  readonly selectedUserAddressId$ = this._selectedUserAddressId$.asObservable();
  get selectedUserAddressId(): string {
    return this._selectedUserAddressId$.getValue();
  }
  get selectedUserAddress$(): Observable<IAddress> {
    return this.selectedUserAddressId$.pipe(map((id) => this.getSelectedUserAddress(id)));
  }

  private readonly _availablePaymentMethods$ = new BehaviorSubject<IPaymentMethodMapToElem[]>([]);
  readonly availablePaymentMethods$ = this._availablePaymentMethods$.asObservable();
  get availablePaymentMethods(): IPaymentMethodMapToElem[] {
    return this._availablePaymentMethods$.getValue();
  }

  private readonly _lastPaymentIntent$ = new BehaviorSubject<stripe.paymentIntents.PaymentIntent>(null);
  readonly lastPaymentIntent$ = this._lastPaymentIntent$.asObservable();
  get lastPaymentIntent(): stripe.paymentIntents.PaymentIntent {
    return this._lastPaymentIntent$.getValue();
  }

  private readonly _selectedPaymentMethod$ = new BehaviorSubject<{ type: PAYMENT_METHOD; source: any }>(null);
  readonly selectedPaymentMethod$ = this._selectedPaymentMethod$.asObservable();
  get selectedPaymentMethod(): { type: PAYMENT_METHOD; source: any } {
    return this._selectedPaymentMethod$.getValue();
  }
  get selectedPaymentMethodFullValue(): IPaymentMethodMapToElem {
    return this.availablePaymentMethods.find((elem) => elem.source.id === this.selectedPaymentMethod?.source?.id);
  }
  get isSelectedPaymentMethodPaypal(): boolean {
    return this.selectedPaymentMethod.type === PAYMENT_METHOD.PAYPAL;
  }

  private readonly _allowedPaymentMethods$ = new BehaviorSubject<IAllowedPaymentMethods>(this._allowedPaymentMethodsInit());
  readonly allowedPaymentMethods$ = this._allowedPaymentMethods$.asObservable();
  get allowedPaymentMethods(): IAllowedPaymentMethods {
    return this._allowedPaymentMethods$.getValue();
  }
  get isIdealAllowed(): boolean {
    return this.allowedPaymentMethods.ideal;
  }
  get isSepaAllowed(): boolean {
    return this.allowedPaymentMethods.sepa;
  }
  get isPaypalAllowed(): boolean {
    return this.allowedPaymentMethods.paypal;
  }

  private readonly _stripeRef$ = new BehaviorSubject<any>(this._stripeRefInit());
  readonly stripeRef$ = this._stripeRef$.asObservable();
  get stripeRef(): any {
    return this._stripeRef$.getValue();
  }

  private readonly _shipperMsg$ = new BehaviorSubject<any>(null);
  readonly shipperMsg$ = this._shipperMsg$.asObservable();
  get shipperMsg(): string {
    return this._shipperMsg$.getValue();
  }

  private readonly _dedicatoryMsg$ = new BehaviorSubject<any>(null);
  readonly dedicatoryMsg$ = this._dedicatoryMsg$.asObservable();
  get dedicatoryMsg(): string {
    return this._dedicatoryMsg$.getValue();
  }

  private readonly _isGroupOrderAvailable$ = new BehaviorSubject<boolean>(false);
  readonly isGroupOrderAvailable$ = this._isGroupOrderAvailable$.asObservable();
  get isGroupOrderAvailable(): boolean {
    return this._isGroupOrderAvailable$.getValue();
  }

  private readonly _isGroupOrder$ = new BehaviorSubject<boolean>(false);
  readonly isGroupOrder$ = this._isGroupOrder$.asObservable();
  get isGroupOrder(): boolean {
    return this._isGroupOrder$.getValue();
  }

  private readonly _isGroupOrderGuestPaymentMode$ = new BehaviorSubject<boolean>(false);
  readonly isGroupOrderGuestPaymentMode$ = this._isGroupOrderGuestPaymentMode$.asObservable();
  get isGroupOrderGuestPaymentMode(): boolean {
    return this._isGroupOrderGuestPaymentMode$.getValue();
  }

  private readonly _cart$ = new BehaviorSubject<IPurchaseCart>(null);
  readonly cart$ = this._cart$.asObservable();
  get cart(): IPurchaseCart {
    return this._cart$.getValue();
  }

  private readonly _isCartInvalid$ = new BehaviorSubject<boolean>(false);
  readonly isCartInvalid$ = this._isCartInvalid$.asObservable();
  get isCartInvalid(): boolean {
    return this._isCartInvalid$.getValue();
  }

  private readonly _purchaseInfo$ = new BehaviorSubject<IPurchaseInfo>(null);
  readonly purchaseInfo$ = this._purchaseInfo$.asObservable();
  get purchaseInfo(): IPurchaseInfo {
    return this._purchaseInfo$.getValue();
  }

  private readonly _credits$ = new BehaviorSubject<number>(0);
  readonly credits$ = this._credits$.asObservable();
  get credits(): number {
    return this._credits$.getValue();
  }

  private readonly _creditsToSpend$ = new BehaviorSubject<number>(0);
  readonly creditsToSpend$ = this._creditsToSpend$.asObservable();
  get creditsToSpend(): number {
    return this._creditsToSpend$.getValue();
  }

  private readonly _showCreditsTooltip$ = new BehaviorSubject<boolean>(false);
  readonly showCreditsTooltip$ = this._showCreditsTooltip$.asObservable();
  get showCreditsTooltip(): boolean {
    return this._showCreditsTooltip$.getValue();
  }

  private readonly _productsInfoTotal$ = new BehaviorSubject<IProductsInfoTotal>({ amount: 0 });
  readonly productsInfoTotal$ = this._productsInfoTotal$.asObservable();
  get productsInfoTotal(): IProductsInfoTotal {
    return this._productsInfoTotal$.getValue();
  }

  private readonly _isCreditsAvailable$ = new BehaviorSubject<boolean>(false);
  readonly isCreditsAvailable$ = this._isCreditsAvailable$.asObservable();
  get isCreditsAvailable(): boolean {
    return this._isCreditsAvailable$.getValue();
  }

  private readonly _isProductSubscriptionAvailable$ = new BehaviorSubject<boolean>(false);
  readonly isProductSubscriptionAvailable$ = this._isProductSubscriptionAvailable$.asObservable();
  get isProductSubscriptionAvailable(): boolean {
    return this._isProductSubscriptionAvailable$.getValue();
  }

  private readonly _isAnyProductSubscriptionActive$ = new BehaviorSubject<boolean>(false);
  readonly isAnyProductSubscriptionActive$ = this._isAnyProductSubscriptionActive$.asObservable();
  get isAnyProductSubscriptionActive(): boolean {
    return this._isAnyProductSubscriptionActive$.getValue();
  }

  private readonly _purchaseErrorItems$ = new BehaviorSubject<string[]>([]);
  readonly purchaseErrorItems$ = this._purchaseErrorItems$.asObservable();
  get purchaseErrorItems(): string[] {
    return this._purchaseErrorItems$.getValue();
  }

  private readonly _isProductGiftAvailable$ = new BehaviorSubject<boolean>(false);
  readonly isProductGiftAvailable$ = this._isProductGiftAvailable$.asObservable();
  get isProductGiftAvailable(): boolean {
    return this._isProductGiftAvailable$.getValue();
  }

  private readonly _maxBoxesPerAdoptions$ = new BehaviorSubject<MaxBoxesPerAdoption[]>([]);
  readonly maxBoxesPerAdoptions$ = this._maxBoxesPerAdoptions$.asObservable();
  get maxBoxesPerAdoptions(): MaxBoxesPerAdoption[] {
    return this._maxBoxesPerAdoptions$.getValue();
  }

  constructor(private activatedRoute: ActivatedRoute, private countrySrv: CountryService) {
    this.init();
  }

  init(): void {
    this.sections = this._buildSections();
    this.cartSections = this._buildCartSections();
    this.subscriptions = new Subscription();
    this.setIsPageLoaded(false);
    this.setUser(null);
    this.setIsUserLogged(false);
    this.setInvalidShipmentCountry(false);
    this.setCountriesByIso({});
    this.setCurrentIso('');
    this.setCurrentCurrency(null);
    this.setProducts([]);
    this.setHasUnavailableProducts(false);
    this.setCurrentSectionIdx(0);
    this.setSummaryOpen(false);
    this.setPrice(0);
    this.setFinalPrice(0);
    this.setUserAddresses([]);
    this.setSelectedUserAddressId(null);
    this.setAvailablePaymentMethods([]);
    this.setLastPaymentIntent(null);
    this.setSelectedPaymentMethod(null);
    this.setAllowedPaymentMethods(this._allowedPaymentMethodsInit());
    this.setStripeRef(this._stripeRefInit());
    this.setShipperMsg(null);
    this.setDedicatoryMsg(null);
    this.setIsGroupOrderAvailable(false);
    this.setIsGroupOrder(false);
    this.setIsGroupOrderGuestPaymentMode(false);
    this.setCart(null);
    this.setIsCartInvalid(false);
    this.setPurchaseInfo(null);
    this.setCredits(0);
    this.setCreditsToSpend(0);
    this.setShowCreditsTooltip(false);
    this.setIsCreditsAvailable(false);
    this.setIsProductSubscriptionAvailable(false);
    this.setIsAnyProductSubscriptionActive(false);
    this.setPurchaseErrorItems([]);
    this.setIsProductGiftAvailable(false);
  }

  unsubscribe(): void {
    this.subscriptions.unsubscribe();
  }

  setIsPageLoaded(value: boolean): void {
    this._isPageLoaded$.next(value);
  }

  setUser(value: UserInterface): void {
    this._user$.next(value);
  }

  setIsUserLogged(value: boolean): void {
    this._isUserLogged$.next(value);
  }

  setInvalidShipmentCountry(value: boolean): void {
    this._invalidShipmentCountry$.next(value);
  }

  setCountriesByIso(value: { [key: string]: ICountry }): void {
    this._countriesByIso$.next(value);
  }

  setCurrentIso(value: string): void {
    this._currentIso$.next(value);
    const country = this.countrySrv.getCurrentCountry();

    country?.currency && this.setCurrentCurrency(country.currency);
  }

  setCurrentCurrency(value: CurrencyType): void {
    this._currentCurrency$.next(value);
  }

  setProducts(value: UnknownObjectType[]): void {
    this._products$.next(value);
  }

  setProduct(value: any): void {
    this._products$.next([...this.products, value]);
  }

  updateProduct(idx: number, value: UnknownObjectType): void {
    const products = [...this.products];

    products[idx] = value;
    this._products$.next(products);
  }

  setHasUnavailableProducts(value: boolean): void {
    this._hasUnavailableProducts$.next(value);
  }

  setCurrentSectionIdx(value: number): void {
    this._currentSectionIdx$.next(value);
  }

  setSummaryOpen(value: boolean): void {
    this._summaryOpen$.next(value);
  }

  setPrice(value: number): void {
    this._price$.next(value);
  }

  setFinalPrice(value: number): void {
    this._finalPrice$.next(value);
  }

  setUserAddresses(value: IAddress[]): void {
    this._userAddresses$.next(value);
  }

  updateUserAddress(id: string, value: IAddress): void {
    const index = this.userAddresses.findIndex((elem) => elem.id === id);
    const userAddresses = [...this.userAddresses];

    if (value.favourite) {
      userAddresses.map((elem) => (elem.favourite = false));
    }
    userAddresses[index] = { ...userAddresses[index], ...value };
    this._userAddresses$.next(userAddresses);
  }

  addUserAddress(value: IAddress): void {
    const userAddresses = [...this.userAddresses, value];

    this._userAddresses$.next(userAddresses);
  }

  canSetNewAddressAsSelected(value: IAddress, currentIso: string): boolean {
    if (this.hasMSSingleBoxesProducts) {
      if ((value.country === 'gb' && currentIso !== value.country) || (currentIso === 'gb' && value.country !== 'gb')) {
        return false;
      }
    }

    return true;
  }

  setSelectedUserAddressId(value: string): void {
    this._selectedUserAddressId$.next(value);
  }

  getSelectedUserAddress(id?: string): IAddress {
    return this.userAddresses.find((elem) => elem.id === (id || this.selectedUserAddressId));
  }

  setAvailablePaymentMethods(value: IPaymentMethodMapToElem[]): void {
    this._availablePaymentMethods$.next(value);
  }

  setLastPaymentIntent(value: stripe.paymentIntents.PaymentIntent): void {
    this._lastPaymentIntent$.next(value);
  }

  setSelectedPaymentMethod(value: { type: PAYMENT_METHOD; source: any }): void {
    this._selectedPaymentMethod$.next(value);
  }

  setAllowedPaymentMethods(value: IAllowedPaymentMethods): void {
    this._allowedPaymentMethods$.next(value);
  }

  setStripeRef(value: any): void {
    this._stripeRef$.next(value);
  }

  setShipperMsg(value: string): void {
    this._shipperMsg$.next(value);
  }

  setDedicatoryMsg(value: string): void {
    this._dedicatoryMsg$.next(value);
  }

  setIsGroupOrderAvailable(value: boolean): void {
    this._isGroupOrderAvailable$.next(value);
  }

  setIsGroupOrder(value: boolean): void {
    this._isGroupOrder$.next(value);
  }

  setIsGroupOrderGuestPaymentMode(value: boolean): void {
    this._isGroupOrderGuestPaymentMode$.next(value);
  }

  setCart(value: IPurchaseCart): void {
    this._cart$.next(value);
  }

  setIsCartInvalid(value: boolean): void {
    this._isCartInvalid$.next(value);
  }

  setPurchaseInfo(value: IPurchaseInfo): void {
    this._purchaseInfo$.next(value);
  }

  setCredits(value: number): void {
    this._credits$.next(value);
  }

  setCreditsToSpend(value: number): void {
    this._creditsToSpend$.next(value);
  }

  setShowCreditsTooltip(value: boolean): void {
    this._showCreditsTooltip$.next(value);
  }

  setProductsInfoTotal(value: IProductsInfoTotal): void {
    this._productsInfoTotal$.next(value);
  }

  setIsCreditsAvailable(value: boolean): void {
    this._isCreditsAvailable$.next(value);
  }

  setIsProductSubscriptionAvailable(value: boolean): void {
    this._isProductSubscriptionAvailable$.next(value);
  }

  setIsAnyProductSubscriptionActive(value: boolean): void {
    this._isAnyProductSubscriptionActive$.next(value);
  }

  setPurchaseErrorItems(value: string[]): void {
    this._purchaseErrorItems$.next(value);
  }

  setIsProductGiftAvailable(value: boolean): void {
    this._isProductGiftAvailable$.next(value);
  }

  setMaxBoxesPerAdoptions(value: MaxBoxesPerAdoption[]): void {
    this._maxBoxesPerAdoptions$.next(value);
  }

  private _buildSections(): ICheckoutSection[] {
    return [
      { label: 'global.Shopping-cart.text-info', path: 'cart', icon: 'eva-shopping-bag-outline' },
      { label: 'global.Shipping.text-info', path: 'shipment', icon: 'eva-car-outline' },
      { label: 'page.payment-method.title', path: 'payment', icon: 'eva-credit-card-outline' },
    ];
  }

  private _buildCartSections(): string[] {
    return ['Step summary', 'Step address', 'Step payment'];
  }

  private _stripeRefInit(): any {
    return {
      card: null,
      stripe: null,
      stripeSecret: null,
      name: null,
      type: null,
    };
  }

  private _allowedPaymentMethodsInit(): IAllowedPaymentMethods {
    return {
      card: false,
      ideal: false,
      sepa: false,
      paypal: false,
      applePay: false,
      klarna: false,
    };
  }
}
