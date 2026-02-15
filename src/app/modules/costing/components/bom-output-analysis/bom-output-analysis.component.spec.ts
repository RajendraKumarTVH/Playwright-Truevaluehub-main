import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BomOutputAnalysisComponent } from './bom-output-analysis.component';

describe('BomOutputAnalysisComponent', () => {
  let component: BomOutputAnalysisComponent;
  let fixture: ComponentFixture<BomOutputAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BomOutputAnalysisComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BomOutputAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
