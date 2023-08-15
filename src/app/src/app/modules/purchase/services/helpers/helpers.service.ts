import { Injectable } from '@angular/core';
import { CountryService, UserService } from '@app/services';
import { CheckoutStoreService } from '../store/checkout-store.service';

@Injectable()
export class CheckoutHelpersService {
  constructor(
    private countrySrv: CountryService,
    private userSrv: UserService,
    private checkoutStoreSrv: CheckoutStoreService
  ) {}

  async checkAndSetCredits(): Promise<void> {
    const { isCreditsAvailable, isUserLogged } = this.checkoutStoreSrv;

    if (isCreditsAvailable && isUserLogged) {
      const currentCountry = this.countrySrv.getCurrentCountry();
      const { credits } = await this.userSrv.getCredits(currentCountry?.currency);

      this.checkoutStoreSrv.setCredits(credits);
    }
  }
}
