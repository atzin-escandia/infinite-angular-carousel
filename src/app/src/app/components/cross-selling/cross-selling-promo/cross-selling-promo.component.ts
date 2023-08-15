import { Component, Injector, Input, ViewEncapsulation, Output, EventEmitter, OnInit } from '@angular/core';
import { BaseComponent } from '@components/base';
import {
  RouterService,
  CountryService,
  DomService,
  CartsService,
  CrossSellingService,
  ConfigService,
  StateService,
} from '@app/services';
import { CrosssellingInfoComponent } from '@popups/crossselling-info-popup';
import { FavouritesSection } from '@interfaces/favourites.interface';

@Component({
  selector: 'cross-selling-promo',
  templateUrl: './cross-selling-promo.component.html',
  styleUrls: ['./cross-selling-promo.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CrossSellingPromoComponent extends BaseComponent implements OnInit {
  @Input() countryName: string;
  @Input() project: any;
  @Input() lang: string;
  @Input() csType: string;
  @Input() i: number;
  @Input() buyNowText: boolean;
  @Input() isLateralCs: boolean;
  @Output() addProduct = new EventEmitter<any>();

  startLazyAt = 6;
  up: any;
  isProductAdded = false;
  isGiftAvailable: boolean;
  crossellingKey = FavouritesSection.CROSS_SELLING;

  constructor(
    public injector: Injector,
    public routerSrv: RouterService,
    public domSrv: DomService,
    private cartSrv: CartsService,
    private countrySrv: CountryService,
    private crossSellingSrv: CrossSellingService,
    public configSrv: ConfigService,
    public stateSrv: StateService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.isGiftAvailable = this.stateSrv.giftEnabled && this.project?.giftAvailable;
  }

  private setProductAdded(): void {
    const cartIds = this.cartSrv.get()?.map((e) => e._up) || [];

    this.isProductAdded = cartIds.includes(this.project.cart._up);
  }

  public addProductClick(): void {
    if (!this.isProductAdded) {
      this.addProduct.emit({ csType: this.csType, i: this.i });
      this.setProductAdded();
    }
  }

  public async openInfoPopup(): Promise<void> {
    if (!this.project.overharvest) {
      try {
        const farmCountry: any = await this.countrySrv.getCountryByIso(this.project.farmAddress.country);
        const upInfo: any = await this.crossSellingSrv.getCrossSellingAdoptionInfo(this.project.code);

        const upInformationReplacements = {
          '{variety}': this.project._m_variety[this.lang],
          '{publicVariety}': this.project._m_publicVariety[this.lang],
          '{masterUnitsMax}': this.project.masterUnitsMax,
          '{production}': this.project._m_production[this.lang],
          '{farmerName}': this.project.farmerName,
          '{farmName}': this.project._m_farmName[this.lang],
          '{cityfarm}': this.project.farmAddress.city,
          '{countryFarm}': farmCountry._m_name[this.lang],
        };

        const popup = this.popupSrv.open(CrosssellingInfoComponent, {
          data: {
            publicVariety: this.project._m_publicVariety[this.lang],
            theProject: upInfo.theProject._m_text[this.lang],
            whatReceive: upInfo.whatReceive._m_text[this.lang],
            replacements: upInformationReplacements,
          },
        });

        popup.onClose.subscribe((result) => {
          if (result) {
            this.addProduct.emit({ csType: this.csType, i: this.i });
          }
        });
      } catch (error) {
        // Just catch
      }
    }
  }
}
