import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BomInputAnalysisComponent } from './bom-input-analysis.component';

describe('BomInputAnalysisComponent', () => {
  let component: BomInputAnalysisComponent;
  let fixture: ComponentFixture<BomInputAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BomInputAnalysisComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BomInputAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
