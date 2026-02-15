import { TestBed } from '@angular/core/testing';

import { SheetMetalLookupService } from './sheet-metal-lookup.service';

describe('SheetMetalLookupService', () => {
  let service: SheetMetalLookupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SheetMetalLookupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
