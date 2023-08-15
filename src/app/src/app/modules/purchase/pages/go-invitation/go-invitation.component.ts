import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { CrossSellingBlockComponent } from '@app/components';
import { ICrossSellingParams, IPurchaseInfo, PurchaseInfoStatus, UnknownObjectType } from '@app/interfaces';
import { CountryService, CrossSellingService, GroupOrderService, RouterService } from '@app/services';
import { StateService } from '@services/state/state.service';
import { PurchaseCoreService } from '../../services/purchase.service';
import { CROSS_SELLING_LOCATIONS, CS_SPECIFICATIONS, MAX_CROSS_SELLING_LIMIT } from '@constants/cross-selling.constants';
import { PurchaseError } from '../../models/error.model';

@Component({
  selector: 'app-go-invitation',
  templateUrl: './go-invitation.component.html',
  styleUrls: ['./go-invitation.component.scss'],
})
export class GoInvitationPageComponent implements OnInit, OnDestroy {
  @ViewChild('CSBlockCmp') CSBlockCmp: CrossSellingBlockComponent;

  isPageLoaded = false;
  purchaseInfo: IPurchaseInfo;
  products: UnknownObjectType[] = [];
  isAvailable = false;
  headerText: string;
  loadingProjects = true;
  csParams: ICrossSellingParams = { limit: MAX_CROSS_SELLING_LIMIT };
  csSpecifications = CS_SPECIFICATIONS;
  currentCountryIso: string;

  public isCsActive = false;

  constructor(
    private stateSrv: StateService,
    private activatedRoute: ActivatedRoute,
    private groupOrderSrv: GroupOrderService,
    private purchaseCoreSrv: PurchaseCoreService,
    private routerSrv: RouterService,
    private translocoSrv: TranslocoService,
    private countrySrv: CountryService,
    private crossSellingSrv: CrossSellingService
  ) {}

  ngOnInit(): void {
    // Load Cross Selling Active Params from Firebase
    this.crossSellingSrv.isCsActive(CROSS_SELLING_LOCATIONS.GROUP_ORDER_INVITATION).subscribe(() => {
      this.isCsActive = true;
    });
    this.purchaseCoreSrv.common.setLoading(true);
    this.purchaseCoreSrv.common.setInnerLoader(true, true);
    this.stateSrv.setShowHeaderNavigation(false);
    void this._initPage();
  }

  ngOnDestroy(): void {
    this.stateSrv.setShowHeaderNavigation(true);
  }

  onPayButtonClick(): void {
    this.routerSrv.navigate('order/checkout', null, { section: 'payment', go: this.purchaseInfo.hash });
  }

  navToRoute(): void {
    this.routerSrv.navigateToFarmersMarket('BOXES');
  }

  onCrossSellingProductAdded(): void {
    this.routerSrv.navigate('order', null, { section: 'cart' });
  }

  onCrossSellingProductReceived(): void {
    this.loadingProjects = false;
  }

  private async _initPage(): Promise<void> {
    const hash = this._checkParams();

    hash ? await this._loadPurchaseInfo(hash) : this._redirectToHome();
    this.isPageLoaded = true;
    this.purchaseCoreSrv.common.setLoading(false);
    this.purchaseCoreSrv.common.setInnerLoader(false, false);
  }

  private _checkParams(): string {
    const { hash } = this.activatedRoute.snapshot.params;

    return hash;
  }

  private async _loadPurchaseInfo(hash: string): Promise<void> {
    try {
      this.purchaseInfo = await this.groupOrderSrv.getPurchaseInfoByHash(hash);

      if (this.purchaseInfo.status === PurchaseInfoStatus.CANCELLED) {
        throw new PurchaseError({
          name: 'GROUP_ORDER_ERROR',
          message: 'Group Order invitation purchase status cancelled',
        });
      }

      this.headerText = this._getHeaderText();
      this.products = await this.purchaseCoreSrv.groupOrder.getProducts(this.purchaseInfo.cart.items, this.purchaseInfo.country);
      this.isAvailable = true;
    } catch (err) {
      this.isAvailable = false;
      this.purchaseCoreSrv.common.logError(err);
      await this.CSBlockCmp.initCrossSelling({ ...this.csParams, country: this.countrySrv.getCountry() });
    }
  }

  private _getHeaderText(): string {
    return this.translocoSrv.translate('page.invitation-to-join-group-order.body', {
      User: `${this.purchaseInfo.crowdfarmer?.name || ''}`,
      x: this.purchaseInfo.guestsLimit,
    });
  }

  private _redirectToHome(): void {
    this.routerSrv.navigate(`/`);
  }
}
