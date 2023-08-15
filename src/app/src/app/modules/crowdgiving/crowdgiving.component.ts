import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { CountryService, RouterService, StateService, StorageService, TextService, UserService } from '@app/services';
import { CrowdgivingPageService } from './crowdgiving.service';
import { CrowdgivingSectionKey } from './interfaces/crowdgiving.interface';
import { Observable } from 'rxjs';
import { CrowdgivingStoreService } from './store/store.service';
import { map } from 'rxjs/operators';
import { ICGProductMapTo } from './interfaces/product.interface';
import { INGO } from './interfaces/ngo.interface';
import { CG_ALLOWED_PAYMENT_METHODS } from './crowdgiving.constants';
import { ICGProject } from './interfaces/project.interface';
import { IAllowedPaymentMethods, IStorageLastPayment, PAYMENT_METHOD, UnknownObjectType, UserInterface } from '@app/interfaces';
import { ActivatedRoute } from '@angular/router';
import { ICGCart } from './interfaces/cart.interface';
import {
  CrowdgivingNgoService,
  CrowdgivingProductService,
  CrowdgivingCartService,
  CrowdgivingOrderService
} from './services';
import { IOrderPayment } from '@app/interfaces/order.interface';
import { ICGOrderCrowdgiving } from './interfaces/order.interface';
import { ICGState } from '@app/interfaces/crowdgiving.interface';
import { PopupService } from '@app/services/popup';
import { GenericPopupComponent } from '@app/popups/generic-popup';

@Component({
  selector: 'app-crowdgiving',
  templateUrl: './crowdgiving.component.html',
  styleUrls: ['./crowdgiving.component.scss']
})
export class CrowdgivingPageComponent implements OnInit, AfterViewInit, OnDestroy {
  user: UserInterface;
  ngosList: INGO[] = [];
  selectedNgoId: string;
  project: ICGProject;
  productsListMapTo: ICGProductMapTo[] = [];
  selectedProductsIds: string[] = [];
  selectedPaymentId: string;
  orderPaymentData: IOrderPayment;
  purchaseDataExtra: ICGOrderCrowdgiving;
  canDisplayContent = false;

  readonly allowedPaymentMethods = CG_ALLOWED_PAYMENT_METHODS;

  get canShowBackButton$(): Observable<boolean> {
    return this.cgStoreSrv.currentSectionIdx$.pipe(
      map((idx) => idx > 0)
    );
  }

  get canShowContinueButton$(): Observable<boolean> {
    return this.cgStoreSrv.currentSectionIdx$.pipe(
      map((idx) => this.cgStoreSrv.sections[idx].key !== 'payment')
    );
  }

  get sectionKey$(): Observable<CrowdgivingSectionKey> {
    return this.cgStoreSrv.currentSectionIdx$.pipe(
      map((idx) => this.cgStoreSrv.sections[idx].key)
    );
  }

  get cart$(): Observable<ICGCart[]> {
    return this.cgStoreSrv.cart$;
  }

  get isContinueButtonDisabled(): boolean {
    switch (this.cgStoreSrv.currentSectionIdx) {
      case 0:
        return !this.selectedNgoId;
      case 1:
        return this.selectedProductsIds.length === 0;
      default:
        return false;
    }
  }

  get totalPrice(): number {
    const value = this.productsListMapTo
      .filter((elem) => this.selectedProductsIds.includes(elem._masterBox))
      .reduce((ac, elem) => ac + (elem.price * elem.selectedQuantity), 0);

    return Number(value.toFixed(2));
  }

  get credits(): number {
    return this.totalPrice ? Number((this.totalPrice * 0.1).toFixed(2)) : 0;
  }

  get selectedNgo(): INGO {
    return this.ngosList.find((elem) => elem._id === this.selectedNgoId);
  }

  get selectedProducts(): ICGProductMapTo[] {
    return this.productsListMapTo.filter((elem) => this.selectedProductsIds.includes(elem._masterBox));
  }

  get selectedProjects(): UnknownObjectType[] {
    return this.project.projects
      .filter((elem) => this.selectedProductsIds.includes(elem._masterBox))
      .map((elem) => ({
        ...elem,
        numMasterBoxes: this.productsListMapTo.find((item) => elem._masterBox === item._masterBox)?.selectedQuantity
      }));
  }

  get cgPaymentExtraData(): { crowdgiving: ICGOrderCrowdgiving } {
    return { crowdgiving: { id: this.selectedNgo?._id, country: this.selectedNgo?.address?.country } };
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private stateSrv: StateService,
    private countrySrv: CountryService,
    private routerSrv: RouterService,
    private userSrv: UserService,
    private storageSrv: StorageService,
    private popupSrv: PopupService,
    private textSrv: TextService,
    private cgPageSrv: CrowdgivingPageService,
    private cgStoreSrv: CrowdgivingStoreService,
    private cgNgoSrv: CrowdgivingNgoService,
    private cgProductSrv: CrowdgivingProductService,
    private cgCartSrv: CrowdgivingCartService,
    private cgOrderSrv: CrowdgivingOrderService,
  ) {}

  ngOnInit(): void {
    void this.initAsync();
  }

  ngAfterViewInit(): void {
    this.stateSrv.setShowHeaderNavigation(false);
  }

  ngOnDestroy(): void {
    this.stateSrv.setShowHeaderNavigation(true);
  }

  goBack(): void {
    void this.cgPageSrv.navToSection(this.cgStoreSrv.currentSectionIdx - 1);
  }

  async continue(): Promise<void> {
    const sectionTo = this.cgStoreSrv.currentSectionIdx + 1;

    if (sectionTo === 2 && !this.user) {
      this.stateSrv.setCgCart(this.getCgCartStateData());
      this.routerSrv.navigate('login-register', null, { rc: true, cg: true });
    } else {
      void this.cgPageSrv.navToSection(sectionTo);

      if (sectionTo === 1) {
        this.cgPageSrv.setInnerLoader(true, true);

        try {
          await this.getNgoProducts();
        } catch (err) {
          // TODO: Catch error
          console.error(err);
        } finally {
          this.cgPageSrv.setInnerLoader(false, false);
        }
      }
    }
  }

  selectedItemsQuantityChangeHandler({ quantity, id }: { quantity: number; id: string }): void {
    this.productsListMapTo.find((elem) => elem._masterBox === id).selectedQuantity = quantity;
    this.onProductsChange();
  }

  selectedItemsIdsChangeHandler(productsIds: string[]): void {
    this.selectedProductsIds = productsIds;
    this.onProductsChange();
  }

  async payCartHandler(orderPaymentData: IOrderPayment): Promise<void> {
    try {
      this.selectedPaymentId = orderPaymentData.intent.id;
      this.orderPaymentData = orderPaymentData;

      const lastPaymentData: IStorageLastPayment = {
        products: this.selectedProjects,
        cart: this.cgStoreSrv.cart,
        price: this.totalPrice,
        paymentIntentId: orderPaymentData.intent.id,
        currency: orderPaymentData.intent.currency,
        payment_method_types: orderPaymentData.intent.payment_method_types as unknown as IAllowedPaymentMethods[],
        payment_method: orderPaymentData.intent.payment_method,
      };

      if (orderPaymentData.type === PAYMENT_METHOD.PAYPAL) {
        this.payCartWithPayPal(lastPaymentData, orderPaymentData.payPalCallbackUrl);
      } else if (orderPaymentData.type === PAYMENT_METHOD.CARD) {
        await this.payCartWithCard(lastPaymentData);
      }
    } catch (err) {
      // TODO: Catch error
      console.error(err);
    } finally {
      orderPaymentData.type !== PAYMENT_METHOD.PAYPAL && this.cgPageSrv.setInnerLoader(false, false);
    }
  }

  private async initAsync(): Promise<void> {
    this.cgPageSrv.setInnerLoader(true, true);
    this.setDefaultCountryIso();

    try {
      await this.setUser();
      await this.getNgosList();
      await this.checkRouter();
    } catch (err) {
      // TODO: Catch error
      console.error(err);
    } finally {
      this.canDisplayContent = true;
      this.cgPageSrv.setInnerLoader(false, false);
    }
  }

  private async setUser(): Promise<void> {
    try {
      this.user = await this.userSrv.get(true);
    } catch (err) {
      if (err.message !== 'USER:NOT_LOGGED') {
        throw err;
      }
    }
  }

  private async checkRouter(): Promise<void> {
    const sectionsIdx = {
      ngos: 0,
      products: 1,
      payment: 2,
    };

    if (Object.keys(sectionsIdx).includes(this.activatedRoute.snapshot.queryParams?.section)) {
      const { isPayPalCallback, isPayPalCallbackSuccess } = this.checkIfComesFromPaypal();

      if (isPayPalCallback) {
        const cgCart = JSON.parse(this.storageSrv.get('cgCart'));
        const paymentIntentId = this.activatedRoute.snapshot.queryParams.payment_intent;

        await this.cgPageSrv.navToSection(sectionsIdx[this.activatedRoute.snapshot.queryParams.section]);
        await this.setStateData(cgCart);

        if (isPayPalCallbackSuccess) {
          this.afterPayPalCallbackSuccess(paymentIntentId);
        } else {
          this.storageSrv.clear('cgCart');
          this.popupSrv.open(GenericPopupComponent, {
            data: {
              id: 'stripe-error',
              msg: this.textSrv.getText('Operation not available')
            }
          });
        }
      } else {
        if (this.activatedRoute.snapshot.queryParams?.section === 'payment' && this.stateSrv.cgCart) {
          await this.setStateData();
        }

        await this.cgPageSrv.navToSection(sectionsIdx[this.activatedRoute.snapshot.queryParams.section]);
      }
    }
  }

  private async setStateData(cgCart: ICGState = this.stateSrv.cgCart): Promise<void> {
    const { ngoId, projects } = cgCart;

    this.selectedNgoId = ngoId;
    await this.getNgoProducts();
    this.selectedProductsIds = projects.map((elem) => elem.id);
    this.productsListMapTo = this.productsListMapTo.map((elem) => ({
      ...elem,
      selectedQuantity: projects.find((item) => item.id === elem._masterBox)?.quantity || 1
    }));
  }

  private setDefaultCountryIso(): void {
    const defaultCountryIso = 'de';

    this.countrySrv.setCountry(defaultCountryIso);
    this.stateSrv.setCurrentCountry(defaultCountryIso);
  }

  private async getNgosList(): Promise<void> {
    const { list } = await this.cgNgoSrv.getNgos();

    this.ngosList = list;
    this.selectedNgoId = this.ngosList[0]._id;
  }

  private async getNgoProducts(): Promise<void> {
    this.project = await this.cgNgoSrv.getNgoProject(this.selectedNgoId);
    this.productsListMapTo = this.cgProductSrv.projectProductsMapTo(this.project);
  }

  private onProductsChange(): void {
    const cart = this.cgCartSrv.mapProducts(this.selectedProjects);

    this.cgStoreSrv.setCart(cart);
  }

  private getCgCartStateData(): ICGState {
    return {
      ngoId: this.selectedNgoId,
      projects: this.selectedProducts.map((elem) => ({
        id: elem._masterBox,
        quantity: elem.selectedQuantity
      }))
    };
  }

  private checkIfComesFromPaypal(): { isPayPalCallback: boolean; isPayPalCallbackSuccess?: boolean } {
    const queryParams = this.activatedRoute.snapshot.queryParams;

    if (queryParams.payment_type === PAYMENT_METHOD.PAYPAL) {
      const paypalRedirectQueryParams = ['payment_intent'];
      const hasRightQueryParams = paypalRedirectQueryParams.every((elem) => Object.keys(queryParams).includes(elem));

      if (queryParams.redirect_status === 'succeeded' && hasRightQueryParams) {
        return { isPayPalCallback: true, isPayPalCallbackSuccess: true };
      } else {
        return { isPayPalCallback: true, isPayPalCallbackSuccess: false };
      }
    }

    return { isPayPalCallback: false };
  }

  private payCartWithPayPal(lastPaymentData: IStorageLastPayment, callbackUrl: string): void {
    this.storageSrv.set('lastPayment', lastPaymentData);
    this.storageSrv.set('cgCart', JSON.stringify(this.getCgCartStateData()));
    window.location.href = callbackUrl;
  }

  private async payCartWithCard(lastPaymentData: IStorageLastPayment): Promise<void> {
    const cgOrderData: ICGOrderCrowdgiving = { id: this.selectedNgo?._id, country: this.selectedNgo?.address?.country };
    const order = await this.cgOrderSrv.generateOrder(cgOrderData, this.orderPaymentData, this.totalPrice);

    lastPaymentData.stripeId = order?.payment?.stripeId;
    lastPaymentData.purchase = order;

    this.storageSrv.set('lastPayment', lastPaymentData);
    this.routerSrv.navigate('order/order-ok', null, { cg: true });
  }

  private afterPayPalCallbackSuccess(paymentIntentId: string): void {
    const lastPaymentData: IStorageLastPayment = {
      ...this.storageSrv.get('lastPayment'),
      paymentIntentId
    };

    this.storageSrv.set('lastPayment', lastPaymentData);
    this.routerSrv.navigate('order/order-ok', null, { cg: true });
    this.storageSrv.clear('cgCart');
  }
}
