import {Pipe, PipeTransform} from '@angular/core';

import {LangService} from '../../services';

// Pipe to translate into language
// Example:
// {{up | translation:'variety'}}

@Pipe({
  name: 'translation',
  pure: false
})
export class TranslationPipe implements PipeTransform {
  constructor(private langSrv: LangService) { }

  /**
   * Trasnform pipe
   */
  transform(value: any, key?: string): string {
    let result = '';
    const lang = this.langSrv.getCurrentLang() || this.langSrv.getDefaultLang();

    if (value) {
      if (value['_m_' + key]) {
        result = value['_m_' + key][lang] || value['_m_' + key].en || value[key];
      } else {
        result = (value[key] && value[key][lang]) || (value[key] && value[key].en) || value[key];
      }
    }

    return result;
  }
}
