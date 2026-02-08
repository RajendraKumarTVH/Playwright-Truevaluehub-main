import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetalExtrusionMaterialComponent } from './metal-extrusion-material.component';

describe('MetalExtrusionMaterialComponent', () => {
  let component: MetalExtrusionMaterialComponent;
  let fixture: ComponentFixture<MetalExtrusionMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MetalExtrusionMaterialComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MetalExtrusionMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
