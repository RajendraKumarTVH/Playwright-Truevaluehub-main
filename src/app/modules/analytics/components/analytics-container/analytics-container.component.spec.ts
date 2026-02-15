import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsContainerComponent } from './analytics-container.component';

describe('AnalyticsContainerComponent', () => {
  let component: AnalyticsContainerComponent;
  let fixture: ComponentFixture<AnalyticsContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnalyticsContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyticsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
