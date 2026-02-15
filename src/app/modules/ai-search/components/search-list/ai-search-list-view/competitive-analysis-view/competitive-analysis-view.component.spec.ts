import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompetitiveAnalysisViewComponent } from './competitive-analysis-view.component';

describe('CompetitiveAnalysisViewComponent', () => {
  let component: CompetitiveAnalysisViewComponent;
  let fixture: ComponentFixture<CompetitiveAnalysisViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompetitiveAnalysisViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CompetitiveAnalysisViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
