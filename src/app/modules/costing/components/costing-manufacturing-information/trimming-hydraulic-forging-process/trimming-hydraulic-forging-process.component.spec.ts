import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrimmingHydraulicForgingProcessComponent } from './trimming-hydraulic-forging-process.component';

describe('TrimmingHydraulicForgingProcessComponent', () => {
  let component: TrimmingHydraulicForgingProcessComponent;
  let fixture: ComponentFixture<TrimmingHydraulicForgingProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrimmingHydraulicForgingProcessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TrimmingHydraulicForgingProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
