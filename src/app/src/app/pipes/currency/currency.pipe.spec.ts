import {CFCurrencyPipe} from './currency.pipe';
import {inject, TestBed} from '@angular/core/testing';
import {CountryService} from '@app/services';

import * as helpers from '../../../test/helper';

describe('CFCurrencyPipe', () => {
  let pipe: CFCurrencyPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: helpers.imports,
      providers: helpers.providers
    });
  });

  beforeEach(inject([CountryService], (CountrySrv: CountryService) => {
    pipe = new CFCurrencyPipe(CountrySrv);
  }));

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
});
