import { Pipe, PipeTransform } from '@angular/core';
import { LangService } from '../../services';

// Pipe to translate into language
// Example:
// {{up | multiLangTranslation}}

@Pipe({
  name: 'multiLangTranslation',
  pure: false,
})
export class MultiLangTranslationPipe implements PipeTransform {
  constructor(private langSrv: LangService) {}

  /**
   * Trasnform pipe
   */
  transform(value: any): string {
    let result = '';
    const lang = this.langSrv.getCurrentLang() || this.langSrv.getDefaultLang();

    if (value) {
      result = value[lang] || value.en;
    }

    return result;
  }
}
