import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachiningMaterialComponent } from './machining-material.component';

describe('MachiningMaterialComponent', () => {
  let component: MachiningMaterialComponent;
  let fixture: ComponentFixture<MachiningMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MachiningMaterialComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MachiningMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
