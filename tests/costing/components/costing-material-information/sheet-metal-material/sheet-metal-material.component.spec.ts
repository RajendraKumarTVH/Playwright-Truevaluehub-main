import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SheetMetalMaterialComponent } from './sheet-metal-material.component';

describe('SheetMetalMaterialComponent', () => {
  let component: SheetMetalMaterialComponent;
  let fixture: ComponentFixture<SheetMetalMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SheetMetalMaterialComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SheetMetalMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
