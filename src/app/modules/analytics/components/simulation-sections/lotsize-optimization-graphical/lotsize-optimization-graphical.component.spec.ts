import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LotsizeOptimizationGraphicalComponent } from './lotsize-optimization-graphical.component';

describe('LotsizeOptimizationGraphicalComponent', () => {
  let component: LotsizeOptimizationGraphicalComponent;
  let fixture: ComponentFixture<LotsizeOptimizationGraphicalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LotsizeOptimizationGraphicalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LotsizeOptimizationGraphicalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
