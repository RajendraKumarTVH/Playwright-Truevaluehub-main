import { ManufacturingPlatingCalculatorService } from './manufacturing-plating-calculatorLogic';

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
