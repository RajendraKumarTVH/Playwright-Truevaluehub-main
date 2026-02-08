import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsulationJacketProcessComponent } from './insulation-jacket-process.component';

describe('InsulationJacketProcessComponent', () => {
  let component: InsulationJacketProcessComponent;
  let fixture: ComponentFixture<InsulationJacketProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InsulationJacketProcessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InsulationJacketProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
