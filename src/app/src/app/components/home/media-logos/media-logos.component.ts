import { Component, Injector, Input, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { BaseComponent } from '@components/base';
import { CountryService, RouterService } from '@app/services';
import { HomeService } from '@services/home/home.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'media-logos',
  templateUrl: './media-logos.component.html',
  styleUrls: ['./media-logos.component.scss'],
})
export class MediaLogosComponent extends BaseComponent implements OnChanges, OnDestroy {
  @Input() country: any;
  @Input() isMobile: boolean;
  @Input() loadMediaLogos: boolean;

  public homeMediaLogos = [];
  public cards = [];
  public countrySubscription: Subscription;
  public loaded = false;

  constructor(public injector: Injector, public routerSrv: RouterService, public countrySrv: CountryService, public homeSrv: HomeService) {
    super(injector);
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes.loadMediaLogos && changes.loadMediaLogos.previousValue === false && !this.loaded) {
      if (!this.country) {
        this.country = this.countrySrv.getCountry();
      }
      await this.loadMediaLogosHome(this.country);
      this.countrySubscription = this.countrySrv.countryChange().subscribe((country) => {
        void this.loadMediaLogosHome(country);
      });
      this.loaded = true;
    }
  }

  ngOnDestroy(): void {
    if (this.countrySubscription) {
      this.countrySubscription.unsubscribe();
    }
  }

  public async loadMediaLogosHome(country: string): Promise<void> {
    this.homeMediaLogos = await this.homeSrv.getMediaLogos(country);
  }
}
