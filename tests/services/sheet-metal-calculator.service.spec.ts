import { TestBed } from '@angular/core/testing';

import { SheetMetalCalculatorService } from './sheet-metal-calculator';

describe('SheetMetalCalculatorService', () => {
  let service: SheetMetalCalculatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SheetMetalCalculatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
