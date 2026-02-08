import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PiercingHydraulicForgingProcessComponent } from './piercing-hydraulic-forging-process.component';

describe('PiercingHydraulicForgingProcessComponent', () => {
  let component: PiercingHydraulicForgingProcessComponent;
  let fixture: ComponentFixture<PiercingHydraulicForgingProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PiercingHydraulicForgingProcessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PiercingHydraulicForgingProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
