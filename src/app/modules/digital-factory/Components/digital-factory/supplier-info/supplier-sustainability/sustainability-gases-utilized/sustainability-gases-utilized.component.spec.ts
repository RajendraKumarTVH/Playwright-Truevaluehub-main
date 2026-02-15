import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SustainabilityGasesUtilizedComponent } from './sustainability-gases-utilized.component';

describe('SustainabilityGasesUtilizedComponent', () => {
  let component: SustainabilityGasesUtilizedComponent;
  let fixture: ComponentFixture<SustainabilityGasesUtilizedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SustainabilityGasesUtilizedComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SustainabilityGasesUtilizedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
