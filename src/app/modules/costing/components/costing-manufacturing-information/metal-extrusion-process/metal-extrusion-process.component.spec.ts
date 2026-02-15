import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetalExtrusionProcessComponent } from './metal-extrusion-process.component';

describe('MetalExtrusionProcessComponent', () => {
  let component: MetalExtrusionProcessComponent;
  let fixture: ComponentFixture<MetalExtrusionProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MetalExtrusionProcessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MetalExtrusionProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
