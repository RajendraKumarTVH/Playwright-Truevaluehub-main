import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostingSecondaryProcessComponent } from './costing-secondary-process.component';

describe('CostingSecondaryProcessComponent', () => {
  let component: CostingSecondaryProcessComponent;
  let fixture: ComponentFixture<CostingSecondaryProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CostingSecondaryProcessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CostingSecondaryProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
