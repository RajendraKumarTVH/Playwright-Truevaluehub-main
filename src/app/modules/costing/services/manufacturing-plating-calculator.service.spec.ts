import { TestBed } from '@angular/core/testing';

import { ManufacturingPlatingCalculatorService } from './manufacturing-plating-calculator.service';

describe('ManufacturingPlatingCalculatorService', () => {
  let service: ManufacturingPlatingCalculatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManufacturingPlatingCalculatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
