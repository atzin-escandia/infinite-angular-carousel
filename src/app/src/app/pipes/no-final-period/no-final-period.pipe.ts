import { Pipe, PipeTransform } from '@angular/core';

// Pipe to do not show the final period (.) in a text
// Example:
// {{ 'anytext.' | noFinalPeriod:true }}
// will produce 'anytext'

@Pipe({
  name: 'noFinalPeriod',
})
export class NoFinalPeriodPipe implements PipeTransform {
  transform(value: string, shouldNotShowFinalPeriodCondition: boolean): string {
    if (typeof value !== 'string' || value.charAt(value.length - 1) !== '.') {
      return value;
    } else {
      return shouldNotShowFinalPeriodCondition ? value.substring(0, value.length - 1) : value;
    }
  }
}
