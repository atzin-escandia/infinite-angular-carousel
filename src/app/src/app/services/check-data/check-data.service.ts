import { Injectable, Injector } from '@angular/core';

import { BaseService } from '../base';

@Injectable({
  providedIn: 'root',
})
export class CheckDataService extends BaseService {
  constructor(public injector: Injector) {
    super(injector);
  }

  public checkDebounce: any;

  /**
   * checks if all forms values are right
   */
  public formValidation(formErrors: any, allFalse: boolean = false): boolean {
    for (const key in formErrors) {
      if (allFalse) {
        if (formErrors[key]) {
          return false;
        }
      } else {
        if (!formErrors[key]) {
          return false;
        }
      }
    }

    return true;
  }

  public checkField(field: string, objToCheck: any): boolean {
    let hasError = false;
    let toCheck: string;

    if (field === 'phoneNumber') {
      toCheck = objToCheck.phone.number.replace(/\D/, '');
    } else if (field === 'phonePrefix') {
      toCheck = objToCheck.phone.prefix.trim();
    } else {
      toCheck = objToCheck[field].trim();
    }

    switch (field) {
      case 'name':
      case 'surnames':
        hasError = toCheck.length > 30 || toCheck.length < 1;
        break;
      case 'details':
        hasError = toCheck.length > 30;
        break;
      case 'number':
        hasError = toCheck.length < 1 || toCheck.length > 10;
        break;
      case 'street':
      case 'city':
        hasError = toCheck.length < 3 || toCheck.length > 30;
        break;
      case 'country':
        hasError = toCheck.length !== 2;
        break;
      case 'phonePrefix':
        hasError = toCheck.length < 1 || toCheck.length > 4;
        break;
      case 'phoneNumber':
        hasError = toCheck.length < 6 || toCheck.length > 12;
        break;
      case 'zip':
        hasError = toCheck.length < 3 || toCheck.length > 10;
    }

    return hasError;
  }

  /**
   * Check if address field is empty
   */
  public validAddress(address: any): boolean {
    const notEmptyNorSpace = /.*\S/;

    return (
      notEmptyNorSpace.test(address.name) &&
      notEmptyNorSpace.test(address.surnames) &&
      notEmptyNorSpace.test(address.street) &&
      notEmptyNorSpace.test(address.city) &&
      notEmptyNorSpace.test(address.zip) &&
      notEmptyNorSpace.test(address.country) &&
      notEmptyNorSpace.test(address.phone.prefix) &&
      notEmptyNorSpace.test(address.phone.number)
    );
  }

  /**
   * validates passwords
   */
  public passwordIsValid(key: string, pass: string, repass?: string, minLenght?: number, maxLenght?: number): boolean {
    const spaceRegex = /^(?!.*[\s+].*)/;
    const letterRegex = /^(?=.*[A-Z].*)(?=.*[a-z].*)/;
    const numberRegex = /^(?=.*\d.*).+$/;

    switch (key) {
      case 'passLength':
        return !this.inputValidLength(pass, minLenght, maxLenght);
      case 'passSpace':
        return spaceRegex.test(pass);
      case 'passLetter':
        return letterRegex.test(pass);
      case 'passNumber':
        return numberRegex.test(pass);
      case 'repass':
        return repass === pass;
    }
  }

  /**
   * Valid lenght
   */
  public validLengthAddress(address: any): boolean {
    return address.street.trim().length >= 3 && address.city.trim().length >= 3 && address.zip.trim().length >= 3;
  }

  /**
   * Valid email
   */
  public emailIsValid(email: string): boolean {
    const validRegex = /^([a-zA-Z-_0-9+])+(\.[a-zA-Z-_0-9+]+)*(@)([a-zA-Z-_0-9]+\.)+([a-zA-Z-_0-9]{2,})$/;

    return validRegex.test(email);
  }

  /**
   * Valid length input text
   */
  public inputValidLength(inputText: string, minLenght: number, maxLenght: number): boolean {
    return inputText.length <= minLenght || inputText.length > maxLenght;
  }

  /**
   * Checks if zip has one of the valid lengths
   */
  public hasValidMaskLenght(countryObj: any, zip: string, maskMax: number, _errMsg: any): boolean {
    if (maskMax > 0) {
      countryObj.zipMasks.map((mask: any) => {
        if (mask.length === zip.length) {
          return true;
        }
        _errMsg = { text: 'Invalid zip code. It should be in this format: {zipMask}', replacement: { '{zipMask}': mask } };
      });
      if (countryObj.zipMasks.lenght > 1) {
        _errMsg = {
          text: 'Invalid zip code. It should be in one of this formats: {zipMasks}',
          replacement: {
            '{zipMasks}': countryObj.zipMasks,
          },
        };
      }

      return false;
    }

    return true;
  }

  /**
   * Checks if current zip startWith with an invalid zip
   */
  public hasValidPrefixZip(countryObj: any, zip: string, _errMsg: any): boolean {
    let isValidZip = true;

    if (!countryObj) {
      return false;
    }
    if (countryObj.forbiddenZips?.length) {
      countryObj.forbiddenZips.map((forbiddenZip: string) => {
        if (zip.toUpperCase().startsWith(forbiddenZip.toUpperCase())) {
          _errMsg = { text: 'Invalid zip code. Forbidden zone.' };
          isValidZip = false;
        }
      });
    }

    return isValidZip;
  }

  /**
   * Validates by field and emits result
   */
  public manageInput(address: any, errorIn: any, countriesByIso: any, maxMask: any, field: string, fromKeyUp: boolean = false): any {
    if (fromKeyUp && !errorIn[field]) {
      return;
    }

    errorIn[field] = this.checkField(field, address);

    if (field === 'zip') {
      errorIn.validZip = !this.hasValidPrefixZip(countriesByIso[address.country], address.zip, {});
      errorIn.lengthZip = !this.hasValidMaskLenght(countriesByIso[address.country], address.zip, maxMask, {});
    }

    return errorIn[field];
  }

  public isInvalidZip(countriesByIso: any, currentCountryIso: string, zipValue: string): boolean {
    const countryObj = countriesByIso[currentCountryIso];

    if (countryObj) {
      if (countryObj.forbiddenZips?.length) {
        return (countryObj.forbiddenZips as string[]).some((forbiddenZip: string) =>
          zipValue.toUpperCase().startsWith(forbiddenZip.toUpperCase())
        );
      }
    }

    return false;
  }

  public checkPaymentMethodName(errorName: boolean, name: string, savingMethod: boolean): boolean {
    return (errorName || savingMethod) && name.length < 3;
  }
}
