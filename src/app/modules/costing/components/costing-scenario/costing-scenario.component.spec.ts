import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostingScenarioComponent } from './costing-scenario.component';

describe('CostingScenarioComponent', () => {
  let component: CostingScenarioComponent;
  let fixture: ComponentFixture<CostingScenarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CostingScenarioComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CostingScenarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
