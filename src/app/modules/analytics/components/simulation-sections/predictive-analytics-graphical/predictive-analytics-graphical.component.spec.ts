import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredictiveAnalyticsGraphicalComponent } from './predictive-analytics-graphical.component';

describe('PredictiveAnalyticsGraphicalComponent', () => {
  let component: PredictiveAnalyticsGraphicalComponent;
  let fixture: ComponentFixture<PredictiveAnalyticsGraphicalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PredictiveAnalyticsGraphicalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PredictiveAnalyticsGraphicalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
