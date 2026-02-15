import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompetitiveAnalysisComponent } from './competitive-analysis.component';

describe('CompetitiveAnalysisComponent', () => {
  let component: CompetitiveAnalysisComponent;
  let fixture: ComponentFixture<CompetitiveAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CompetitiveAnalysisComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CompetitiveAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
