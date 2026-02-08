import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsulationJacketComponent } from './insulation-jacket.component';

describe('InsulationJacketComponent', () => {
  let component: InsulationJacketComponent;
  let fixture: ComponentFixture<InsulationJacketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InsulationJacketComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InsulationJacketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
