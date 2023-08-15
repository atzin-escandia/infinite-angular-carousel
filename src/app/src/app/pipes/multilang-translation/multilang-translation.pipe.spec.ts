import { MultiLangTranslationPipe } from './multilang-translation.pipe';
import { inject, TestBed } from '@angular/core/testing';
import { LangService } from '../../services/lang';

import * as helpers from '../../../test/helper';

describe('MultiLangTranslationPipe', () => {
  let pipe: MultiLangTranslationPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: helpers.imports,
      providers: helpers.providers,
    });
  });

  beforeEach(inject([LangService], (langSrv: LangService) => {
    pipe = new MultiLangTranslationPipe(langSrv);
  }));

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
});
