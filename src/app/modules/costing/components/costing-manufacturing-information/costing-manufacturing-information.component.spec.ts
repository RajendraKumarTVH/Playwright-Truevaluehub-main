import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostingManufacturingInformationComponent } from './costing-manufacturing-information.component';

describe('CostingManufacturingInformationComponent', () => {
  let component: CostingManufacturingInformationComponent;
  let fixture: ComponentFixture<CostingManufacturingInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CostingManufacturingInformationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CostingManufacturingInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
