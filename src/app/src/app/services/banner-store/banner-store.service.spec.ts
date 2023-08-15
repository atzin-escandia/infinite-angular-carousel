import {TestBed} from '@angular/core/testing';

import {BannerStoreService} from './banner-store.service';

import * as helpers from '../../../test/helper';

describe('BannerStoreService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports]
    });
  });

  it('should be created', () => {
    const service: BannerStoreService = TestBed.inject(BannerStoreService);
    expect(service).toBeTruthy();
  });

  describe('feature', () => {
    let service: BannerStoreService;

    beforeEach(() => {
      service = TestBed.inject(BannerStoreService);
      localStorage.clear();

      service.init();
    });

    it('should be true by default', () => {
      expect(service.get()).toBeTruthy();
    });

    it('should be true on setting it', () => {
      service.set(true);
      expect(service.get()).toBeTruthy();
    });

    it('should be false on remove it', () => {
      localStorage.clear();
      expect(service.get()).toBeFalsy();
    });
  });
});
