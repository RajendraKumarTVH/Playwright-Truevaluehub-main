import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostingPcbContainerComponent } from './costing-pcb-container.component';

describe('CostingPcbContainerComponent', () => {
  let component: CostingPcbContainerComponent;
  let fixture: ComponentFixture<CostingPcbContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CostingPcbContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CostingPcbContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
