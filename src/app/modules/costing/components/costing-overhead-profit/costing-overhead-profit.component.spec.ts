import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostingOverheadProfitComponent } from './costing-overhead-profit.component';

describe('CostingOverheadProfitComponent', () => {
  let component: CostingOverheadProfitComponent;
  let fixture: ComponentFixture<CostingOverheadProfitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CostingOverheadProfitComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CostingOverheadProfitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
