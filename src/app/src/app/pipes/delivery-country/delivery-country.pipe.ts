import {Pipe, PipeTransform} from '@angular/core';
import {LangService} from '../../services';
import {TranslationPipe} from '../translation/translation.pipe';

@Pipe({
  name: 'deliveryCountry'
})
export class DeliveryCountryPipe implements PipeTransform {
  constructor(private langSrv: LangService) { }

  transform(value: any, selectedItem: any, isDeliveryCountry: boolean, inputSearch: string): any {
    if (value?.length > 0) {
      // Delivery Country Case
      if (isDeliveryCountry) {
        // First, remove from the list the selected country
        if (selectedItem?.iso) {
          value = value.filter((item: any) => item.iso !== selectedItem.iso);
        }
        // Second, apply the search
        if (inputSearch?.trim()) {
          const translationPipe = new TranslationPipe(this.langSrv);

          value = value.filter((item: any) => {
            if (translationPipe.transform(item, item?._m_order ? 'order' : 'name').toLowerCase().startsWith(inputSearch.toLowerCase())) {
              return item;
            }
          });
        }
      } else {
        // Language Case - Only remove from the list the selected language
        if (selectedItem?.shortName) {
          value = value.filter((item: any) => item.shortName !== selectedItem.shortName);
        }
      }
    }

    return value;
  }
}
