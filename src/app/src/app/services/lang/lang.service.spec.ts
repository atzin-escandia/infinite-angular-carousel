import {TestBed} from '@angular/core/testing';

import {LangService} from './lang.service';

import * as helpers from '../../../test/helper';

const dataSet = [
  {value: 'es', expected: 'es'},
  {value: 'en', expected: 'en'},
  {value: 'de', expected: 'de'},
  {value: 'fr', expected: 'fr'}
];

describe('LangService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports]
    });
  });

  it('should be created', () => {
    const service: LangService = TestBed.inject(LangService);
    expect(service).toBeTruthy();
  });

  describe('feature', () => {
    let service: LangService;

    beforeEach(() => {
      service = TestBed.inject(LangService);
    });

    it('should get "English" as default language', () => {
      expect(service.getDefaultLang()).toBe('en');
    });

    it('should detect the browser language', () => {
      expect(service.getLangBrowser()).toBe('en');
    });

    for (const set of dataSet) {
      it('should set language -> ' + set.value, () => {
        service.setCurrentLang(set.value);
        expect(service.getCurrentLang()).toBeTruthy();
      });
    }
  });
});
