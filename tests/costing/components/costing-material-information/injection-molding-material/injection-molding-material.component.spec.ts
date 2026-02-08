import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InjectionMoldingMaterialComponent } from './injection-molding-material.component';

describe('InjectionMoldingMaterialComponent', () => {
  let component: InjectionMoldingMaterialComponent;
  let fixture: ComponentFixture<InjectionMoldingMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InjectionMoldingMaterialComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InjectionMoldingMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
