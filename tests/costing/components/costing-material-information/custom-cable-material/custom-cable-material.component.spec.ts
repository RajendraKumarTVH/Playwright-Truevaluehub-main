import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomCableMaterialComponent } from './custom-cable-material.component';

describe('CustomCableMaterialComponent', () => {
  let component: CustomCableMaterialComponent;
  let fixture: ComponentFixture<CustomCableMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomCableMaterialComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomCableMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
