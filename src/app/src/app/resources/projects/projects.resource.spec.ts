import {TestBed} from '@angular/core/testing';

import {ProjectsResource} from './projects.resource';

import * as helpers from '../../../test/helper';

describe('ProjextsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be created', () => {
    const service: ProjectsResource = TestBed.inject(ProjectsResource);
    expect(service).toBeTruthy();
  });
});
