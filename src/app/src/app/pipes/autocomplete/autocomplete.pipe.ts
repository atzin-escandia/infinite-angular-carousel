import {Pipe, PipeTransform} from '@angular/core';
import {MediatorsService} from '../../../app/mediators/mediators.service';

@Pipe({
  name: 'autocomplete',
  pure: false
})
export class AutocompletePipe implements PipeTransform {

  constructor(private mediator: MediatorsService){ }

  transform(countries: any[], search: string): any[] {
    const arrCountriesMatched = countries.filter((country) => country.name.toLowerCase().startsWith(search.toLowerCase()));
    const hasMatches = arrCountriesMatched.length > 0;

    this.mediator.emitCountryAutocompleteMatch(hasMatches);

    return arrCountriesMatched;
  }
}
