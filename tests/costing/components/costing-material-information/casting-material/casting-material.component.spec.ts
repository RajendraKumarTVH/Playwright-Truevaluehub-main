import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CastingMaterialComponent } from './casting-material.component';

describe('CastingMaterialComponent', () => {
  let component: CastingMaterialComponent;
  let fixture: ComponentFixture<CastingMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CastingMaterialComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CastingMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
