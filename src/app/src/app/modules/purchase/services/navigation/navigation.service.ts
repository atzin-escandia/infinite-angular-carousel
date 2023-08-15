import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckoutStoreService } from '../store/checkout-store.service';

@Injectable()
export class CheckoutNavigationService {
  constructor(private router: Router, private storeSrv: CheckoutStoreService, private activatedRoute: ActivatedRoute) {}

  public async navToCheckoutSection(sectionIdx: number): Promise<void> {
    await this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        section: this.storeSrv.sections[sectionIdx].path,
      },
    });
  }
}
