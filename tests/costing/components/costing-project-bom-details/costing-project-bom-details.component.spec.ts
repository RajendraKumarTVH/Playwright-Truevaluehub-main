import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostingProjectBomDetailsComponent } from './costing-project-bom-details.component';

describe('CostingProjectBomDetailsComponent', () => {
  let component: CostingProjectBomDetailsComponent;
  let fixture: ComponentFixture<CostingProjectBomDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CostingProjectBomDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CostingProjectBomDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
