import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputOutputAnalysisComponentComponent } from './input-output-analysis-component.component';

describe('InputOutputAnalysisComponentComponent', () => {
  let component: InputOutputAnalysisComponentComponent;
  let fixture: ComponentFixture<InputOutputAnalysisComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InputOutputAnalysisComponentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InputOutputAnalysisComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
