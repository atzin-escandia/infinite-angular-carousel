import {TestBed} from '@angular/core/testing';

import {LoaderService} from './loader.service';

import * as helpers from '../../../test/helper';

describe('LoaderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports]
    });
  });

  it('should be created', () => {
    const service: LoaderService = TestBed.inject(LoaderService);
    expect(service).toBeTruthy();
  });

  describe('feature', () => {
    let service: LoaderService;

    beforeEach(() => {
      service = TestBed.inject(LoaderService);
    });

    it('should be true by default', () => {
      expect(service.isActive()).toBeTruthy();
    });

    it('should be false on setting', () => {
      service.setLoading(false);
      expect(service.isActive()).toBeFalsy();
    });

    it('should be true on set it false and true', () => {
      service.setLoading(false);
      service.setLoading(true);
      expect(service.isActive()).toBeTruthy();
    });
  });
});
