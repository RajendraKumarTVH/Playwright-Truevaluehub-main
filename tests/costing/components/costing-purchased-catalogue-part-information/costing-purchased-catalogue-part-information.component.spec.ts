import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostingPurchasedCataloguePartInformationComponent } from './costing-purchased-catalogue-part-information.component';

describe('CostingPurchasedCataloguePartInformationComponent', () => {
  let component: CostingPurchasedCataloguePartInformationComponent;
  let fixture: ComponentFixture<CostingPurchasedCataloguePartInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CostingPurchasedCataloguePartInformationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CostingPurchasedCataloguePartInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
