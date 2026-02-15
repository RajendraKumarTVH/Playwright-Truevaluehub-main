import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostingCostSummaryComponent } from './costing-cost-summary.component';

describe('CostingCostSummaryComponent', () => {
  let component: CostingCostSummaryComponent;
  let fixture: ComponentFixture<CostingCostSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CostingCostSummaryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CostingCostSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
