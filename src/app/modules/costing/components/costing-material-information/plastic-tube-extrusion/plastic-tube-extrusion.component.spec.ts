import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlasticTubeExtrusionComponent } from './plastic-tube-extrusion.component';

describe('PlasticTubeExtrusionComponent', () => {
  let component: PlasticTubeExtrusionComponent;
  let fixture: ComponentFixture<PlasticTubeExtrusionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlasticTubeExtrusionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlasticTubeExtrusionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
