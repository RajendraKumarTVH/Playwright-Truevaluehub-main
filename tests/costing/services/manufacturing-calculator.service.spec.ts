import { TestBed } from '@angular/core/testing';

import { ManufacturingCalculatorService } from './manufacturing-calculator.service';

describe('ManufacturingCalculatorService', () => {
  let service: ManufacturingCalculatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManufacturingCalculatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
