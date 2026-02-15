import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavedAnalysisComponent } from './saved-analysis.component';

describe('SavedAnalysisComponent', () => {
  let component: SavedAnalysisComponent;
  let fixture: ComponentFixture<SavedAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SavedAnalysisComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SavedAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
