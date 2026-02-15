import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlasticVacuumFormingComponent } from './plastic-vacuum-forming.component';

describe('PlasticVacuumFormingComponent', () => {
  let component: PlasticVacuumFormingComponent;
  let fixture: ComponentFixture<PlasticVacuumFormingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlasticVacuumFormingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlasticVacuumFormingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
