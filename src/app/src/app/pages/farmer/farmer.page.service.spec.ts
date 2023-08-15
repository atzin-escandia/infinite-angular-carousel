import {TestBed} from '@angular/core/testing';

import * as helpers from '../../../test/helper';
import {FarmerPageService} from './farmer.page.service';

describe('FarmerPageService', () => {
  let service: FarmerPageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers, FarmerPageService]
    });
    service = TestBed.inject(FarmerPageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return the index of the selected master box', () => {
    expect(service.getSelectedMasterBoxIndex(
      true, true, true, 0, 0)).toBe(0);
    expect(service.getSelectedMasterBoxIndex(
      true, true, true, 0, 1)).toBe(1);
    expect(service.getSelectedMasterBoxIndex(
      true, true, true, 1, 1)).toBe(1);
    expect(service.getSelectedMasterBoxIndex(
      true, true, true, 0, 2)).toBe(2);
    expect(service.getSelectedMasterBoxIndex(
      true, true, true, 2, 2)).toBe(2);
    expect(service.getSelectedMasterBoxIndex(
      true, true, true, 1, 2)).toBe(2);

    expect(service.getSelectedMasterBoxIndex(
      true, false, false, 0, -1)).toBe(0);
    expect(service.getSelectedMasterBoxIndex(
      true, false, false, 1, -1)).toBe(1);
    expect(service.getSelectedMasterBoxIndex(
      true, false, false, 2, -1)).toBe(2);

    expect(service.getSelectedMasterBoxIndex(
      true, true, false, 0, 1)).toBe(0);
    expect(service.getSelectedMasterBoxIndex(
      true, true, false, 0, 2)).toBe(0);
    expect(service.getSelectedMasterBoxIndex(
      true, true, false, 1, 0)).toBe(1);
    expect(service.getSelectedMasterBoxIndex(
      true, true, false, 1, 2)).toBe(1);
    expect(service.getSelectedMasterBoxIndex(
      true, true, false, 2, 0)).toBe(2);
    expect(service.getSelectedMasterBoxIndex(
      true, true, false, 2, 1)).toBe(2);

    expect(service.getSelectedMasterBoxIndex(
      false, true, false, -1, 0)).toBe(0);
    expect(service.getSelectedMasterBoxIndex(
      false, true, false, -1, 1)).toBe(1);
    expect(service.getSelectedMasterBoxIndex(
      false, true, false, -1, 2)).toBe(2);

    expect(service.getSelectedMasterBoxIndex(
      false, false, false, -1, -1)).toBe(0);
  });
});
