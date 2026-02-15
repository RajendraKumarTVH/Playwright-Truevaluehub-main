import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SustainabilityMarketCompetitivenessComponent } from './sustainability-market-competitiveness.component';

describe('SustainabilityMarketCompetitivenessComponent', () => {
  let component: SustainabilityMarketCompetitivenessComponent;
  let fixture: ComponentFixture<SustainabilityMarketCompetitivenessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SustainabilityMarketCompetitivenessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SustainabilityMarketCompetitivenessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
