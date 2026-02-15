import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostingPartInformationComponent } from './costing-part-information.component';

describe('CostingPartInformationComponent', () => {
  let component: CostingPartInformationComponent;
  let fixture: ComponentFixture<CostingPartInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CostingPartInformationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CostingPartInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
