import { Component, Input } from '@angular/core';
import { FARMER_ICONS_TYPE, FARMET_LOKALISE_ID_TYPES } from '@app/constants/farmer-icons-types.constant';
import { Seal } from '@app/interfaces';
import { DomService } from '@app/services';
import { ArticleDTO, FarmerTypeDTO } from '../../interfaces';

@Component({
  selector: 'ec-detail-info',
  templateUrl: './ec-detail-info.component.html',
  styleUrls: ['./ec-detail-info.component.scss'],
})
export class EcDetailInfoComponent {
  detailData: ArticleDTO;
  farmerItems: FarmerTypeDTO[];

  @Input() set articleData(newValue: ArticleDTO) {
    this.detailData = newValue;
    this.setItemIcons();
  }
  @Input() farmerSeals: Seal[];
  @Input() upSeals: Seal[];

  constructor(private domSrv: DomService) {}

  setItemIcons(): void {
    this.farmerItems = this.detailData.farmer.extraInfo.map((item: FarmerTypeDTO) => ({ ...item, icon: FARMER_ICONS_TYPE[item.type] }));
  }

  getItemTitle(title: string): string {
    return FARMET_LOKALISE_ID_TYPES[title];
  }

  buildMap(hide: boolean): void {
    setTimeout(() => {
      if (
        !hide &&
        this.domSrv.isPlatformBrowser() &&
        this.domSrv.getElement('.map-frame') &&
        !this.domSrv.getElement('.map-frame').getAttribute('src')
      ) {
        this.domSrv.getElement('.map-frame').setAttribute('src', this.detailData.farmer.mapURL);
      }
    }, 200);
  }
}
