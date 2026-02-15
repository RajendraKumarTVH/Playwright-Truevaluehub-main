import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlasticVacuumFormingProcessComponent } from './plastic-vacuum-forming-process.component';

describe('PlasticVacuumFormingProcessComponent', () => {
  let component: PlasticVacuumFormingProcessComponent;
  let fixture: ComponentFixture<PlasticVacuumFormingProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlasticVacuumFormingProcessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlasticVacuumFormingProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
