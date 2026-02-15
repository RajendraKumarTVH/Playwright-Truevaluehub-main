import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlasticTubeExtrusionProcessComponent } from './plastic-tube-extrusion-process.component';

describe('PlasticTubeExtrusionProcessComponent', () => {
  let component: PlasticTubeExtrusionProcessComponent;
  let fixture: ComponentFixture<PlasticTubeExtrusionProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlasticTubeExtrusionProcessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlasticTubeExtrusionProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
