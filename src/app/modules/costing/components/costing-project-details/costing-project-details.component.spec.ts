import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostingProjectDetailsComponent } from './costing-project-details.component';

describe('CostingProjectDetailsComponent', () => {
  let component: CostingProjectDetailsComponent;
  let fixture: ComponentFixture<CostingProjectDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CostingProjectDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CostingProjectDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
