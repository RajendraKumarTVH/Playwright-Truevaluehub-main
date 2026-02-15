import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimulationCalculationComponent } from './simulation-calculation.component';

describe('SimulationCalculationComponent', () => {
  let component: SimulationCalculationComponent;
  let fixture: ComponentFixture<SimulationCalculationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SimulationCalculationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SimulationCalculationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
