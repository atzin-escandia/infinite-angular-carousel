import {ElementRef, Pipe, PipeTransform} from '@angular/core';

// Pipe to get CDN source url depending on calling element's width.
// Example:
// {{src | cdn:width?}}

@Pipe({
  name: 'cdn',
  pure: false
})
export class CDNPipe implements PipeTransform {
  constructor(private e: ElementRef) { }

  /**
   * Transform pipe
   */
  transform(value: any, width?: number): string {
    if (value) {
      let result = value && value.url ? value.url : value;
      const eWidth = this.e.nativeElement.width;
      const firstChar = result.includes('?') ? '&' : '?';

      if (width) {
        result += `${firstChar}Imwidth=${width}`;
      } else if (eWidth) {
        result += `${firstChar}Imwidth=${Math.ceil(eWidth / 100) * 100}`;
      }

      // // TODO - Fix undefined and zero width elements
      // // image-lazy, image-and-text, up-header image, order-ok carrousel
      // if ((!width && !eWidth) || (!width && eWidth == 0)) {
      //   console.groupCollapsed(this.e.nativeElement.dataset.cy ? this.e.nativeElement.dataset.cy : this.e.nativeElement.className);
      //   console.log(this.e);
      //   console.log('width:\n' + width);
      //   console.log('eWidth:\n' + eWidth);
      //   console.log(this.e.nativeElement);
      //   console.log('result:\n' + result);
      //   console.groupEnd();
      // }

      return result;
    }

    return null;
  }
}
