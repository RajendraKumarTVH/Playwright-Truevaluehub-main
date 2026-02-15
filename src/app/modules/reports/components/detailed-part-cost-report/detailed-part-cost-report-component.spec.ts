import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailedPartCostReportComponent } from './detailed-part-cost-report-component';

describe('DetailedPartCostReportComponentComponent', () => {
  let component: DetailedPartCostReportComponent;
  let fixture: ComponentFixture<DetailedPartCostReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetailedPartCostReportComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailedPartCostReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
