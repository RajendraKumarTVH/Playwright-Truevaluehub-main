import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostingInformationComponent } from './costing-information.component';

describe('CostingInformationComponent', () => {
  let component: CostingInformationComponent;
  let fixture: ComponentFixture<CostingInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CostingInformationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CostingInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
