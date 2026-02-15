import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SustainabilityFuelsComponent } from './sustainability-fuels.component';

describe('SustainabilityFuelsComponent', () => {
  let component: SustainabilityFuelsComponent;
  let fixture: ComponentFixture<SustainabilityFuelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SustainabilityFuelsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SustainabilityFuelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
