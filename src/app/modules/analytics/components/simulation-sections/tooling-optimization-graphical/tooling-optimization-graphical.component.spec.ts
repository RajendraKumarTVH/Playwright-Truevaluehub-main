import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolingOptimizationGraphicalComponent } from './tooling-optimization-graphical.component';

describe('ToolingOptimizationGraphicalComponent', () => {
  let component: ToolingOptimizationGraphicalComponent;
  let fixture: ComponentFixture<ToolingOptimizationGraphicalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ToolingOptimizationGraphicalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToolingOptimizationGraphicalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
