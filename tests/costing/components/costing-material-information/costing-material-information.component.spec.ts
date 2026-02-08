import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostingMaterialInformationComponent } from './costing-material-information.component';

describe('CostingMaterialInformationComponent', () => {
  let component: CostingMaterialInformationComponent;
  let fixture: ComponentFixture<CostingMaterialInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CostingMaterialInformationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CostingMaterialInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
