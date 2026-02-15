import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManufacturingSustainabilityComponent } from './manufacturing-sustainability.component';

describe('ManufacturingSustainabilityComponent', () => {
  let component: ManufacturingSustainabilityComponent;
  let fixture: ComponentFixture<ManufacturingSustainabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManufacturingSustainabilityComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManufacturingSustainabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
