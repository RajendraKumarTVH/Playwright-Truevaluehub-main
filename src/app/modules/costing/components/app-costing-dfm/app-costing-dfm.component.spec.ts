import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostingDfmComponent } from './app-costing-dfm.component';

describe('CostingDfmComponent', () => {
  let component: CostingDfmComponent;
  let fixture: ComponentFixture<CostingDfmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CostingDfmComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CostingDfmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
