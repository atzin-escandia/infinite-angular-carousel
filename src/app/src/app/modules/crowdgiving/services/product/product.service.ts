import { Injectable } from '@angular/core';
import { ICGProductMapTo } from '../../interfaces/product.interface';
import { LangService, TextService } from '@app/services';
import { ICGProject } from '../../interfaces/project.interface';

@Injectable()
export class CrowdgivingProductService {

  constructor(
    private textSrv: TextService,
    private langSrv: LangService,
  ) { }

  projectProductsMapTo(project: ICGProject): ICGProductMapTo[] {
    return project.projects.map((elem) => ({
      _masterBox: elem._masterBox,
      img: elem.up?.masterBoxes?.[0]?.pictureURL,
      name: `${this.textSrv.getText('Box/es of')} ${elem.up?._m_production?.[this.langSrv.getCurrentLang()] as string}`,
      farmer: {
        name: elem.farm?._m_name?.[this.langSrv.getCurrentLang()],
        country: (elem.farm?.address?.country as string)?.toUpperCase(),
      },
      price: elem.price,
      selectedQuantity: 1,
    }));
  }
}
