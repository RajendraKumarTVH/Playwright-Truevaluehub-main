import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostingToolingInfoComponent } from './costing-tooling-info.component';

describe('CostingToolingInfoComponent', () => {
  let component: CostingToolingInfoComponent;
  let fixture: ComponentFixture<CostingToolingInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CostingToolingInfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CostingToolingInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
