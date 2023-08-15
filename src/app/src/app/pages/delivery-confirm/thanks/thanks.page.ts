import { Component, OnInit, Injector, OnDestroy } from '@angular/core';
import { BasePage } from '@pages/base';
import { Subscription } from 'rxjs';
import { CountryService, CrossSellingService, OrdersService } from '@app/services';
import { CROSS_SELLING_LOCATIONS } from '@constants/cross-selling.constants';

@Component({
  selector: 'thanks-page',
  templateUrl: './thanks.page.html',
  styleUrls: ['./thanks.page.scss'],
})
export class ThanksPageComponent extends BasePage implements OnInit, OnDestroy {
  public orderId: string;
  public paramSubscrip: Subscription;
  public country: string;
  public csParams: any = {};
  public csSpecifications: any = {};
  public isCsActive = false;
  public loadingProjects = true;
  public currentLang: string;

  constructor(
    public injector: Injector,
    public countrySrv: CountryService,
    private ordersSrv: OrdersService,
    private crossSellingSrv: CrossSellingService
  ) {
    super(injector);
  }

  async ngOnInit(): Promise<void> {
    // Load Cross Selling Active Params from Firebase
    this.crossSellingSrv.isCsActive(CROSS_SELLING_LOCATIONS.THANKS_LANDING).subscribe(() => {
      this.isCsActive = true;
    });
    this.country = this.countrySrv.getCountry();
    this.currentLang = this.langSrv.getCurrentLang();
    this.paramSubscrip = this.route.params.subscribe((params) => {
      if (params.orderId) {
        this.orderId = params.orderId;
      }
    });

    this.showCrossSelling();

    const deliveryFeedbackInfo = {
      orderId: this.orderId,
      deliveryIssue: false,
    };

    await this.ordersSrv.deliveryFeedback(deliveryFeedbackInfo);

    this.setLoading(false);
    this.setInnerLoader(false, false);
  }

  ngOnDestroy(): void {
    if (this.paramSubscrip) {
      this.paramSubscrip.unsubscribe();
    }
  }

  private showCrossSelling(): void {
    if (this.country) {
      this.csParams.country = this.country;
    }

    if (this.user) {
      this.csParams.user = this.user._id;
    }

    this.csParams.limit = 4;

    this.csSpecifications = {
      crossSellingSB: {
        header: 'boxes to be planned',
        trackingListName: 'csLandingThanks SB',
        trackingGA4ListName: 'CS_Landing_Thanks/Single_Boxes',
      },
      ohProjects: {
        header: 'http://page.youmight-also-like.body',
        trackingListName: 'csLandingThanks OH',
        trackingGA4ListName: 'CS_Landing_Thanks/Overharvest',
      },
      adoptionProjects: {
        header: 'global.available-adoption.title',
        trackingListName: 'csLandingThanks Adoptions',
        trackingGA4ListName: 'CS_Landing_Thanks/Adoptions',
      },
      trackingActionName: 'csLandingThanks',
    };
  }

  goToOrder(): void {
    this.routerSrv.navigate('private-zone/my-order/info/' + this.orderId);
  }

  /**
   * from child component emit -> redirects to shopping cart after adding cs product
   */
  public addedCrossSelling(): void {
    this.routerSrv.navigateToOrderSection('cart');
  }

  public hideSkeletonLoader(): void {
    this.loadingProjects = false;
  }
}
