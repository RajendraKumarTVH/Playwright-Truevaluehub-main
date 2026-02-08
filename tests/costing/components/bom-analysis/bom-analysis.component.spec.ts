import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BomAnalysisComponent } from './bom-analysis.component';

describe('BomAnalysisComponent', () => {
  let component: BomAnalysisComponent;
  let fixture: ComponentFixture<BomAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BomAnalysisComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BomAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
