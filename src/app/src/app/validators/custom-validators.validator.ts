import {AbstractControl, ValidatorFn} from '@angular/forms';
import {ICountry} from '../interfaces/country.interface';

export class CustomValidators {

  static countries(countries: ICountry[]): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} => {
      if (!control.value) {
        return null;
      }

      const countryMatched = countries.filter((country) => country.name.toLowerCase() === control.value.toLowerCase());

      return countryMatched.length > 0 ? null : {country: true};
    };
  }

  static minMax30(): ValidatorFn {
   return (control: AbstractControl): {[key: string]: any} => control.value.length > 0 && control.value.length < 30 ? null : {minMax: true};
  }

  static email(): ValidatorFn {
    // eslint-disable-next-line max-len
    const regexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return (control: AbstractControl): {[key: string]: any} => regexp.test(control.value) ? null : {email: true};
   }
}
