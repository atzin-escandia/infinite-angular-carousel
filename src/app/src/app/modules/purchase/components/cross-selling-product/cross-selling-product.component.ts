import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CrosssellingInfoComponent } from '../../../../popups/crossselling-info-popup';
import { CrosssellingNameComponent } from '../../../../popups/crossselling-name-popup';
import { CartsService, CountryService, TextService } from '../../../../services';
import { PopupService } from '../../../../services/popup';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'cross-selling-product',
  templateUrl: './cross-selling-product.component.html',
  styleUrls: ['./cross-selling-product.component.scss'],
})
export class CrossSellingProductComponent {
  @Input() product: any;
  @Input() lang: string;
  @Input() index: number;
  @Input() buyNowText: boolean;

  @Output() addProduct = new EventEmitter<any>();

  public env = environment;

  constructor(
    public textSrv: TextService,
    private countrySrv: CountryService,
    private popupSrv: PopupService,
    private cartsSrv: CartsService
  ) {}

  public async openInfoPopup(): Promise<void> {
    if (!this.product.overharvest) {
      const farmCountry: any = await this.countrySrv.getCountryByIso(this.product.farmAddress.country);
      const upInformationReplacements = {
        '{variety}': this.product._m_variety[this.lang],
        '{publicVariety}': this.product._m_publicVariety[this.lang],
        '{masterUnitsMax}': this.product.masterUnitsMax,
        '{production}': this.product._m_production[this.lang],
        '{farmerName}': this.product.farmerName,
        '{farmName}': this.product.farmName[this.lang],
        '{cityfarm}': this.product.farmAddress.city,
        '{countryFarm}': farmCountry._m_name[this.lang],
      };

      this.popupSrv
        .open(CrosssellingInfoComponent, {
          data: {
            publicVariety: this.product._m_publicVariety[this.lang],
            theProject: this.product._m_theProject[this.lang],
            whatReceive: this.product._m_whatReceive[this.lang],
            replacements: upInformationReplacements,
          },
        })
        .onClose.subscribe((result) => {
          if (result) {
            this.editProductName();
          }
        });
    }
  }

  public editProductName(): void {
    const products = [
      {
        name: this.product.name || null,
        picture: this.product.pictureURL,
        publicVariety: this.product.publicVariety,
        index: this.index,
      },
    ];

    this.popupSrv
      .open(CrosssellingNameComponent, {
        data: { products },
      })
      .onClose.subscribe((result) => {
        if (result) {
          const product = { ...this.product };

          product.name = result[0].name;
          this.emitAdoptionProduct(product);
        }
      });
  }

  public addProductHandler(): void {
    if (this.product.uberUp?.name) {
      this.emitAdoptionProduct();
    } else {
      !this.product.upCf && !this.product.overharvest ? this.editProductName() : this.emitOhProduct();
    }
  }

  public emitOhProduct(): void {
    this.addProduct.emit(this.product);
  }

  public emitAdoptionProduct(product: any = this.product): void {
    this.addProduct.emit(product);
  }
}
