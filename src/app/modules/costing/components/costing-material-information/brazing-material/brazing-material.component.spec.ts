import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrazingMaterialComponent } from './brazing-material.component';

describe('BrazingMaterialComponent', () => {
  let component: BrazingMaterialComponent;
  let fixture: ComponentFixture<BrazingMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BrazingMaterialComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BrazingMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
