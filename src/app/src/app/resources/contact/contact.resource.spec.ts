import {TestBed} from '@angular/core/testing';

import {ContactResource} from './contact.resource';

import * as helpers from '../../../test/helper';

describe('ContactService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be created', () => {
    const service: ContactResource = TestBed.inject(ContactResource);
    expect(service).toBeTruthy();
  });
});
