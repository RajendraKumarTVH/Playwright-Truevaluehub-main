import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RigidFlexMaterialComponent } from './rigid-flex-material.component';

describe('RigidFlexMaterialComponent', () => {
  let component: RigidFlexMaterialComponent;
  let fixture: ComponentFixture<RigidFlexMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RigidFlexMaterialComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RigidFlexMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
