import {TestBed} from '@angular/core/testing';

import {StorageService} from './storage.service';

import * as helpers from '../../../test/helper';

const dataSet = [
  {key: 'test', value: {a: 1}, expected: {a: 1}},
  {key: 'test', value: 'test', expected: 'test'},
  {key: 'test', value: 25, expected: 25},
  {key: 'test', value: [1, 2, 3], expected: [1, 2, 3]},
  {key: 'test', value: [{a: 1}], expected: [{a: 1}]},
  {key: 'test', value: null, expected: null},
  {key: 'test', value: {}, expected: {}},
  {key: 'test', value: [], expected: []},
  {key: 'test', value: undefined, expected: undefined}
];

describe('StorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be created', () => {
    const service: StorageService = TestBed.inject(StorageService);
    expect(service).toBeTruthy();
  });

  describe('feature', () => {
    let service: StorageService;

    beforeEach(() => {
      service = TestBed.inject(StorageService);
      localStorage.clear();

      service.init();
    });

    for (const set of dataSet) {
      it('check typeof ' + typeof set.value, () => {
        service.set(set.key, set.value);
        expect(service.get(set.key)).toEqual(set.expected);
      });
    }

    afterEach(() => {
      localStorage.clear();
    });
  });
});
