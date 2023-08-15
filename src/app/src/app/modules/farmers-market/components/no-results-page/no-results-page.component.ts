import { Component, Injector, Input, ViewEncapsulation, OnInit } from '@angular/core';
import { PopoverService } from '@app/services/popover';
import { Subscription } from 'rxjs';
import { CROSS_SELLING_LOCATIONS, CS_SPECIFICATIONS_NO_RESULTS, MAX_CROSS_SELLING_LIMIT } from '@constants/cross-selling.constants';
import { BasePage } from '@app/pages';
import { CountryService, CrossSellingService, DomService, RouterService } from '@app/services';

@Component({
  selector: 'no-results-page',
  templateUrl: './no-results-page.component.html',
  styleUrls: ['./no-results-page.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NoResultsPageComponent extends BasePage implements OnInit {
  @Input() idPage: string;

  customClose: () => void;
  paramSubscrip: Subscription;
  isMobile: boolean;
  country: string;
  csParams: any = {};
  csSpecifications: any = {};
  isCsActive = false;
  currentLang: string;
  loadingProjects = true;
  loadingFallbackProjectsCS = false;

  constructor(
    public injector: Injector,
    public countrySrv: CountryService,
    public routerSrv: RouterService,
    public popoverSrv: PopoverService,
    public domSrv: DomService,
    private crossSellingSrv: CrossSellingService
  ) {
    super(injector);
    this.isMobile = this.domSrv.getIsDeviceSize();
  }

  ngOnInit(): void {
    // Load Cross Selling Active Params from Firebase
    this.crossSellingSrv.isCsActive(CROSS_SELLING_LOCATIONS.FARMERS_MARKET).subscribe(() => {
      this.isCsActive = true;
    });
    this.country = this.countrySrv.getCountry();
    this.currentLang = this.langSrv.getCurrentLang();

    this.showCrossSelling();
    this.setLoading(false);
    this.setInnerLoader(false, false);
  }

  hideSkeletonLoader(): void {
    this.loadingProjects = false;
    this.loadingFallbackProjectsCS = false;
  }

  showCrossSelling(): void {
    if (this.country) {
      this.csParams.country = this.country;
    }

    if (this.user) {
      this.csParams.user = this.user._id;
    }

    this.csParams.limit = MAX_CROSS_SELLING_LIMIT;
    this.csSpecifications = CS_SPECIFICATIONS_NO_RESULTS;
  }

  addedCrossSelling(): void {
    this.routerSrv.navigateToOrderSection('cart');
  }
}
