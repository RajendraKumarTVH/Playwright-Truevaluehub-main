import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierSustainabilityComponent } from './supplier-sustainability.component';

describe('SupplierSustainabilityComponent', () => {
  let component: SupplierSustainabilityComponent;
  let fixture: ComponentFixture<SupplierSustainabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierSustainabilityComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SupplierSustainabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
