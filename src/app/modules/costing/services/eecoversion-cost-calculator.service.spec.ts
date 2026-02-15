import { TestBed } from '@angular/core/testing';

import { EECoversionCostCalculatorService } from './eecoversion-cost-calculator.service';

describe('EECoversionCostCalculatorService', () => {
  let service: EECoversionCostCalculatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EECoversionCostCalculatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
