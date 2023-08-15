import { Injector, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  public constructor(private readonly injector: Injector) {}

  transform(value: any[], callback: any): any {
    return value.filter(callback);
  }
}
