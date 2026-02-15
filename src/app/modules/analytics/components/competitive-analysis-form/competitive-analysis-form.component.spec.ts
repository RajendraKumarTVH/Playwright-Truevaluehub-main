import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompetitiveAnalysisFormComponent } from './competitive-analysis-form.component';

describe('CompetitiveAnalysisFormComponent', () => {
  let component: CompetitiveAnalysisFormComponent;
  let fixture: ComponentFixture<CompetitiveAnalysisFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompetitiveAnalysisFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CompetitiveAnalysisFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
