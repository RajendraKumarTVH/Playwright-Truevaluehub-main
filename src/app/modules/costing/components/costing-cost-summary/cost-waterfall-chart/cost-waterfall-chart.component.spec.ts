import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostWaterfallChartComponent } from './cost-waterfall-chart.component';

describe('CostWaterfallChartComponent', () => {
  let component: CostWaterfallChartComponent;
  let fixture: ComponentFixture<CostWaterfallChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CostWaterfallChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CostWaterfallChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
