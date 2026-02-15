import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SustainabilityAnnualUsageComponent } from './sustainability-annual-usage.component';

describe('SustainabilityAnnualUsageComponent', () => {
  let component: SustainabilityAnnualUsageComponent;
  let fixture: ComponentFixture<SustainabilityAnnualUsageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SustainabilityAnnualUsageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SustainabilityAnnualUsageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
