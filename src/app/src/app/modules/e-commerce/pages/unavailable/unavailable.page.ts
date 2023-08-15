import { Component, Injector, Input, OnInit } from '@angular/core';
import { RouterService } from '@app/services';
import { EcommerceBasePage } from '../../resources/ecommerce-base/ecommerce-base.page';
import { DEFAULT_UNAVAILABLE_IMG } from './constant/default-unavailable-img.constant';
import { Subscription } from 'rxjs';
import { ECommerceService } from '../../services';
import { E_COMMERCE_ROUTES } from '../../constant/routes.constant';

@Component({
  selector: 'unavailable',
  templateUrl: './unavailable.page.html',
  styleUrls: ['./unavailable.page.scss'],
})
export class UnavailableComponent extends EcommerceBasePage implements OnInit {
  @Input() urlImage = DEFAULT_UNAVAILABLE_IMG;

  availableEcommerceSub: Subscription;
  isErrorPath: boolean;

  constructor(public injector: Injector, private routerSvr: RouterService, private ecommerceSrv: ECommerceService) {
    super(injector);
  }

  ngOnInit(): void {
    this.checkRoute();
  }

  checkRoute(): void {
    const path = this.routerSvr.getPath();

    this.isErrorPath = path.includes(E_COMMERCE_ROUTES.ERROR);

    if (!this.isErrorPath) {
      this.getEcommerceAvailability();
    }
  }

  getEcommerceAvailability(): void {
    this.availableEcommerceSub = this.ecommerceSrv.isEcommerceAvailable().subscribe({
      next: (available) => {
        if (available) {
          this.goToCatalog();
        }
      },
    });
  }

  goToCatalog(): void {
    // force another run cycle
    setTimeout(() => {
      this.routerSvr.navigateToEcommerce();
    }, 0);
  }

  goToInit(): void {
    this.routerSvr.navigate('/');
  }

  goToBuyBox(): void {
    this.routerSvr.navigateToFarmersMarket('BOXES');
  }
}
