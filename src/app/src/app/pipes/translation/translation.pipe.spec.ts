import {TranslationPipe} from './translation.pipe';
import {inject, TestBed} from '@angular/core/testing';
import {LangService} from '../../services/lang';

import * as helpers from '../../../test/helper';

describe('TranslationPipe', () => {
  let pipe: TranslationPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: helpers.imports,
      providers: helpers.providers
    });
  });

  beforeEach(inject([LangService], (langSrv: LangService) => {
    pipe = new TranslationPipe(langSrv);
  }));

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
});
