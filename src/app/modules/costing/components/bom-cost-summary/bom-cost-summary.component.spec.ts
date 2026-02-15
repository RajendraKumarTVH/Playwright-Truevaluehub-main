import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BomCostSummaryComponent } from './bom-cost-summary.component';

describe('BomCostSummaryComponent', () => {
  let component: BomCostSummaryComponent;
  let fixture: ComponentFixture<BomCostSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BomCostSummaryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BomCostSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
