import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectronicsPCBAMaterialComponent } from './electronics-pcba-material.component';

describe('ElectronicsPCBAMaterialComponent', () => {
  let component: ElectronicsPCBAMaterialComponent;
  let fixture: ComponentFixture<ElectronicsPCBAMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ElectronicsPCBAMaterialComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ElectronicsPCBAMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
