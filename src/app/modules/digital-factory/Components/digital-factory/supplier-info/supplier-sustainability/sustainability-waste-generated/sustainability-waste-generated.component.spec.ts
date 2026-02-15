import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SustainabilityWasteGeneratedComponent } from './sustainability-waste-generated.component';

describe('SustainabilityWasteGeneratedComponent', () => {
  let component: SustainabilityWasteGeneratedComponent;
  let fixture: ComponentFixture<SustainabilityWasteGeneratedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SustainabilityWasteGeneratedComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SustainabilityWasteGeneratedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
