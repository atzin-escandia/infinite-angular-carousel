import { inject, TestBed } from '@angular/core/testing';
import * as helpers from '../../../test/helper';
import { TranslateSealsPipe } from './translate-seals.pipe';
import { TranslocoService } from '@ngneat/transloco/public-api';
import { ChangeDetectorRef } from '@angular/core';

describe('TranslateSealsPipe', () => {
  let pipe: TranslateSealsPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: helpers.imports,
      providers: helpers.providers
    });
  });

  beforeEach(inject([TranslocoService, ChangeDetectorRef], (translocoSrvSrv: TranslocoService, cdr: ChangeDetectorRef) => {
    pipe = new TranslateSealsPipe(translocoSrvSrv, cdr);
  }));

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
});
